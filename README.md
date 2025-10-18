# Heart Rate Variability Calculator

A lightweight web application for exploring time-domain heart rate variability (HRV) metrics from RR interval data. Paste your RR intervals (in milliseconds) into the tool to obtain standard metrics such as SDNN, RMSSD and pNN50, along with an interactive chart of the interval series.

## Getting started

1. Open `index.html` directly in your browser, or serve the project with any static file server:

   ```bash
   python -m http.server 8000
   ```

2. Navigate to <http://localhost:8000> (or double click `index.html`) and paste RR interval data separated by commas, spaces, or new lines.

3. Click **Calculate HRV** to view the metrics and chart.

The **Load sample data** button fills in a short example dataset that can be used to see how the interface works.

## Metrics included

- **Mean RR** and **Mean HR** (derived from the mean RR interval)
- **SDNN** – standard deviation of the RR intervals
- **RMSSD** – root mean square of successive differences
- **pNN50** – percentage of successive differences greater than 50 ms
- **Triangular Index** – ratio of total RR intervals to the modal frequency of the histogram (20 ms bins)

> ⚠️ The calculator is designed for educational and exploratory purposes. Consult qualified healthcare professionals before making medical decisions.
