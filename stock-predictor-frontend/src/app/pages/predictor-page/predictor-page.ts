import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StockApiService } from '../../services/stock-api.services';
import { Chart } from 'chart.js/auto';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

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
  modelWarnings: string[] = [];

  suggestions: any[] = [];
  showSuggestions = false;
  private searchSubject = new Subject<string>();

  @ViewChild('stockChart') chartRef!: ElementRef<HTMLCanvasElement>;

  constructor(private api: StockApiService, private cdr: ChangeDetectorRef) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.api.searchTickers(query))
    ).subscribe({
      next: (res) => {
        this.suggestions = res.results || [];
        this.showSuggestions = this.suggestions.length > 0;
      },
      error: () => {
        this.suggestions = [];
        this.showSuggestions = false;
      }
    });
  }

  onTickerInput() {
    const query = this.ticker.trim();
    if (query.length < 2) {
      this.suggestions = [];
      this.showSuggestions = false;
      return;
    }
    this.searchSubject.next(query);
  }

  selectSuggestion(s: any) {
    this.ticker = s.symbol;
    this.suggestions = [];
    this.showSuggestions = false;
    this.search();
  }

  hideSuggestions() {
    setTimeout(() => { this.showSuggestions = false; }, 150);
  }

  search() {
    const trimmed = this.ticker.trim();
    if (!trimmed) {
      this.error = 'Please enter a ticker symbol or company name.';
      return;
    }

    this.showSuggestions = false;
    this.loading = true;
    this.error = '';
    this.result = null;
    this.modelWarnings = [];

    const looksLikeTicker = /^[A-Za-z0-9.\-]{1,10}$/.test(trimmed) && !trimmed.includes(' ');

    if (looksLikeTicker) {
      this.runPrediction(trimmed);
    } else {
      this.api.searchTickers(trimmed).subscribe({
        next: (res) => {
          const match = res.results?.[0];
          if (match) {
            this.ticker = match.symbol;
            this.runPrediction(match.symbol);
          } else {
            this.error = `Could not find a ticker for "${trimmed}". Try selecting from the dropdown.`;
            this.loading = false;
          }
        },
        error: () => {
          this.error = 'Could not resolve company name. Try a ticker symbol instead.';
          this.loading = false;
        }
      });
    }
  }

  runPrediction(symbol: string) {
    this.api.getAll(symbol).subscribe({
      next: (res) => {
        if (res.recommendation?.error) {
          this.error = res.recommendation.error;
          this.loading = false;
          return;
        }
        this.result = res;
        this.loading = false;
        this.cdr.detectChanges();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (this.chartRef && this.chartRef.nativeElement) {
              this.buildChart(res);
            }
          });
        });
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

    const pad = (arr: number[] | undefined) => {
      if (!Array.isArray(arr)) {
        return new Array(historyLabels.length + 7).fill(null);
      }
      return [
        ...new Array(historyLabels.length - 1).fill(null),
        historyCloses[historyCloses.length - 1],
        ...arr
      ];
    };

    if (this.chart) {
      this.chart.destroy();
    }

    this.modelWarnings = [];

    const datasets: any[] = [
      {
        label: 'Historical Close',
        data: [...historyCloses, ...new Array(7).fill(null)],
        borderColor: '#333',
        borderWidth: 2,
        fill: false
      }
    ];

    if (res.recommendation?.linear?.forecast) {
      datasets.push({
        label: 'Linear Regression',
        data: pad(res.recommendation.linear.forecast),
        borderColor: '#1f77b4',
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#1f77b4',
        fill: false
      });
    } else {
      this.modelWarnings.push('Linear Regression unavailable for this ticker.');
    }

    if (res.recommendation?.arima?.forecast) {
      datasets.push({
        label: 'ARIMA',
        data: pad(res.recommendation.arima.forecast),
        borderColor: '#ff7f0e',
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#ff7f0e',
        fill: false
      });
    } else {
      this.modelWarnings.push('ARIMA unavailable for this ticker (insufficient historical data).');
    }

    if (res.recommendation?.lstm?.forecast) {
      datasets.push({
        label: 'LSTM',
        data: pad(res.recommendation.lstm.forecast),
        borderColor: '#2ca02c',
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#2ca02c',
        fill: false
      });
    } else {
      this.modelWarnings.push('LSTM unavailable for this ticker (needs 1+ year of history).');
    }

    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: { legend: { display: true } }
      }
    });
  }
}