const rrInput = document.getElementById('rr-input');
const calculateButton = document.getElementById('calculate');
const clearButton = document.getElementById('clear');
const loadSampleButton = document.getElementById('load-sample');
const metricsContainer = document.getElementById('metrics');
const errorMessage = document.getElementById('error-message');
const chartCanvas = document.getElementById('rr-chart');

let rrChart;

function parseInput(text) {
    return text
        .split(/[\s,;]+/)
        .map((value) => Number.parseFloat(value))
        .filter((value) => Number.isFinite(value));
}

function mean(values) {
    return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function standardDeviation(values, meanValue) {
    if (values.length < 2) {
        return 0;
    }
    const variance =
        values.reduce((acc, value) => acc + Math.pow(value - meanValue, 2), 0) / (values.length - 1);
    return Math.sqrt(variance);
}

function rmssd(values) {
    if (values.length < 2) {
        return 0;
    }
    let sumSquares = 0;
    for (let i = 1; i < values.length; i += 1) {
        const diff = values[i] - values[i - 1];
        sumSquares += diff * diff;
    }
    return Math.sqrt(sumSquares / (values.length - 1));
}

function pnn50(values) {
    if (values.length < 2) {
        return 0;
    }
    let count = 0;
    for (let i = 1; i < values.length; i += 1) {
        if (Math.abs(values[i] - values[i - 1]) > 50) {
            count += 1;
        }
    }
    return (count / (values.length - 1)) * 100;
}

function triangularIndex(values) {
    if (values.length === 0) {
        return 0;
    }
    const binWidth = 20;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const binCount = Math.max(1, Math.ceil((maxValue - minValue) / binWidth) + 1);
    const histogram = new Array(binCount).fill(0);

    values.forEach((value) => {
        const index = Math.min(binCount - 1, Math.floor((value - minValue) / binWidth));
        histogram[index] += 1;
    });

    const maxBin = Math.max(...histogram);
    return values.length / maxBin;
}

function createMetricElement(label, value) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    return [dt, dd];
}

function formatMs(value) {
    return `${value.toFixed(2)} ms`;
}

function formatBpm(value) {
    return `${value.toFixed(2)} bpm`;
}

function formatPercent(value) {
    return `${value.toFixed(2)} %`;
}

function updateChart(values) {
    if (!chartCanvas) {
        return;
    }

    const labels = values.map((_, index) => index + 1);

    const data = {
        labels,
        datasets: [
            {
                label: 'RR Interval (ms)',
                data: values,
                fill: false,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.35)',
                tension: 0.25,
                pointRadius: 2.5,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Beat index',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'RR interval (ms)',
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label(context) {
                        return `${context.parsed.y.toFixed(2)} ms`;
                    },
                },
            },
        },
    };

    if (rrChart) {
        rrChart.data = data;
        rrChart.options = options;
        rrChart.update();
        return;
    }

    rrChart = new Chart(chartCanvas, {
        type: 'line',
        data,
        options,
    });
}

function displayMetrics(metrics) {
    metricsContainer.innerHTML = '';
    metrics.forEach(({ label, value }) => {
        const [dt, dd] = createMetricElement(label, value);
        metricsContainer.appendChild(dt);
        metricsContainer.appendChild(dd);
    });
}

function calculateMetrics(values) {
    const stats = {};

    stats.count = values.length;
    stats.min = Math.min(...values);
    stats.max = Math.max(...values);

    const meanRR = mean(values);
    stats.meanRR = meanRR;
    stats.meanHR = 60000 / meanRR;
    stats.sdnn = standardDeviation(values, meanRR);
    stats.rmssd = rmssd(values);
    stats.pnn50 = pnn50(values);
    stats.triangularIndex = triangularIndex(values);

    return stats;
}

function formatMetrics(stats) {
    const metrics = [
        { label: 'Total beats', value: stats.count.toString() },
        { label: 'Min RR', value: formatMs(stats.min) },
        { label: 'Max RR', value: formatMs(stats.max) },
        { label: 'Mean RR', value: formatMs(stats.meanRR) },
        { label: 'Mean HR', value: formatBpm(stats.meanHR) },
        { label: 'SDNN', value: formatMs(stats.sdnn) },
        { label: 'RMSSD', value: formatMs(stats.rmssd) },
        { label: 'pNN50', value: formatPercent(stats.pnn50) },
        { label: 'Triangular Index', value: stats.triangularIndex.toFixed(2) },
    ];

    return metrics;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.visibility = message ? 'visible' : 'hidden';
}

function handleCalculate() {
    const values = parseInput(rrInput.value);

    if (values.length === 0) {
        showError('Please enter at least one RR interval value.');
        metricsContainer.innerHTML = '';
        if (rrChart) {
            rrChart.destroy();
            rrChart = null;
        }
        return;
    }

    if (values.length === 1) {
        showError('At least two RR intervals are required to compute variability metrics.');
        metricsContainer.innerHTML = '';
        if (rrChart) {
            rrChart.destroy();
            rrChart = null;
        }
        return;
    }

    showError('');
    const stats = calculateMetrics(values);
    const formatted = formatMetrics(stats);
    displayMetrics(formatted);
    updateChart(values);
}

function handleClear() {
    rrInput.value = '';
    metricsContainer.innerHTML = '';
    showError('');
    if (rrChart) {
        rrChart.destroy();
        rrChart = null;
    }
}

function loadSample() {
    const sample = [
        824, 810, 799, 812, 820, 832, 845, 830, 822, 816,
        808, 799, 790, 785, 792, 804, 816, 828, 835, 821,
        812, 800, 796, 805, 817, 829, 840, 830, 818, 807,
        799, 792, 785, 793, 805, 817, 828, 836, 824, 810,
    ];
    rrInput.value = sample.join(', ');
    showError('');
    metricsContainer.innerHTML = '';
    if (rrChart) {
        rrChart.destroy();
        rrChart = null;
    }
}

calculateButton.addEventListener('click', handleCalculate);
clearButton.addEventListener('click', handleClear);
loadSampleButton.addEventListener('click', loadSample);

rrInput.addEventListener('input', () => {
    if (!rrInput.value.trim()) {
        showError('');
    }
});

showError('');
