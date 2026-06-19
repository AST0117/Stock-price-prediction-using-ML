import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StockApiService } from '../../services/stock-api.services';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-predictor-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './predictor-page.html'
})
export class PredictorPage {
  ticker = '';
  loading = false;
  result: any = null;
  error = '';
  chart: Chart | null = null;

  @ViewChild('stockChart') chartRef!: ElementRef<HTMLCanvasElement>;

  constructor(private api: StockApiService) {}

  search() {
    const trimmed = this.ticker.trim();
    if (!trimmed) {
      this.error = 'Please enter a ticker symbol.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.result = null;

    this.api.getAll(trimmed).subscribe({
      next: (res) => {
        if (res.recommendation?.error) {
          this.error = res.recommendation.error;
          this.loading = false;
          return;
        }
        this.result = res;
        this.loading = false;
        setTimeout(() => this.buildChart(res), 0);
      },
      error: (err) => {
        this.error = err.error?.error || 'Could not fetch data — check the ticker symbol.';
        this.loading = false;
      }
    });
  }

  getVerdictClass(): string {
    const verdict = this.result?.recommendation?.verdict;
    if (verdict === 'Likely to Rise') return 'verdict-rise';
    if (verdict === 'Likely to Fall') return 'verdict-fall';
    return 'verdict-hold';
  }

  buildChart(res: any) {
    const history = res.history.history;
    const last30 = history.slice(-30);
    const historyLabels = last30.map((h: any) => h.date);
    const historyCloses = last30.map((h: any) => h.close);

    const lastDate = new Date(last30[last30.length - 1].date);
    const futureLabels: string[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(lastDate);
      d.setDate(d.getDate() + i);
      futureLabels.push(d.toISOString().split('T')[0]);
    }

    const labels = [...historyLabels, ...futureLabels];
    const pad = (arr: number[]) => [
      ...new Array(historyLabels.length - 1).fill(null),
      historyCloses[historyCloses.length - 1],
      ...arr
    ];

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Historical Close', data: [...historyCloses, ...new Array(7).fill(null)], borderColor: '#333', fill: false },
          { label: 'Linear Regression', data: pad(res.recommendation.linear.forecast), borderColor: '#1f77b4', fill: false },
          { label: 'ARIMA', data: pad(res.recommendation.arima.forecast), borderColor: '#ff7f0e', fill: false },
          { label: 'LSTM', data: pad(res.recommendation.lstm.forecast), borderColor: '#2ca02c', fill: false }
        ]
      },
      options: { responsive: true, plugins: { legend: { display: true } } }
    });
  }
}