import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { LivePriceService } from '../../services/live-price.service';
import { StockApiService } from '../../services/stock-api.services';

@Component({
  selector: 'app-live-prices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './live-prices.html'
})
export class LivePrices implements OnDestroy {
  ticker = '';
  trackedTickers: string[] = [];
  prices: { [key: string]: any } = {};
  error = '';
  private pollSub?: Subscription;

  suggestions: any[] = [];
  showSuggestions = false;
  private searchSubject = new Subject<string>();

  constructor(private livePrice: LivePriceService, private api: StockApiService) {
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
    this.addTicker();
  }

  hideSuggestions() {
    setTimeout(() => { this.showSuggestions = false; }, 150);
  }

  addTicker() {
    this.error = '';
    const raw = this.ticker.trim();
    if (!raw) return;

    const looksLikeTicker = /^[A-Za-z0-9.\-]{1,10}$/.test(raw) && !raw.includes(' ');

    if (looksLikeTicker) {
      this.confirmAddTicker(raw.toUpperCase());
    } else {
      this.api.searchTickers(raw).subscribe({
        next: (res) => {
          const match = res.results?.[0];
          if (match) {
            this.confirmAddTicker(match.symbol);
          } else {
            this.error = `Could not find a ticker for "${raw}". Try selecting from the dropdown.`;
          }
        },
        error: () => { this.error = 'Could not resolve company name.'; }
      });
    }
  }

  confirmAddTicker(symbol: string) {
    if (this.trackedTickers.includes(symbol)) {
      this.ticker = '';
      return;
    }
    this.trackedTickers.push(symbol);
    this.ticker = '';
    this.showSuggestions = false;
    this.fetchAll();

    if (!this.pollSub) {
      this.pollSub = interval(15000).subscribe(() => this.fetchAll());
    }
  }

  removeTicker(t: string) {
    this.trackedTickers = this.trackedTickers.filter(x => x !== t);
    delete this.prices[t];
  }

  fetchAll() {
    this.trackedTickers.forEach(t => {
      this.livePrice.getPrice(t).subscribe({
        next: (res) => { this.prices[t] = res; },
        error: (err) => { this.prices[t] = { error: err.error?.error || 'Failed to fetch' }; }
      });
    });
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }
}