import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { LivePriceService } from '../../services/live-price.service';
import { WatchlistService } from '../../services/watchlist.service';
import { StockApiService } from '../../services/stock-api.services';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard-home.html'
})
export class DashboardHome implements OnInit {
  watchlist: any[] = [];
  snapshotData: { [key: string]: any } = {};
  newTicker = '';
  watchlistError = '';

  suggestions: any[] = [];
  showSuggestions = false;

  features = [
    { title: 'Predict Prices', desc: 'Forecast next 7 days using ARIMA, LSTM & Linear Regression', icon: '📈', link: '/dashboard/predictor' },
    { title: 'Live Prices', desc: 'Track real-time prices for your favorite stocks', icon: '💹', link: '/dashboard/live-prices' },
    { title: 'Stock News', desc: 'Latest headlines for any ticker', icon: '📰', link: '/dashboard/news' },
    { title: 'Currency Converter', desc: 'Convert between world currencies instantly', icon: '💱', link: '/dashboard/currency' },
    { title: 'Learn Stocks', desc: 'Understand ARIMA, LSTM, sentiment & more', icon: '🎓', link: '/dashboard/education' },
    { title: 'Download Tickers', desc: 'Get the full NASDAQ ticker list as CSV', icon: '📥', link: '/dashboard/tickers' },
  ];

  constructor(
    public auth: AuthService,
    private livePrice: LivePriceService,
    private watchlistService: WatchlistService,
    private api: StockApiService
  ) {}

  ngOnInit() {
    this.loadWatchlist();
  }

  loadWatchlist() {
    this.watchlistService.getAll().subscribe({
      next: (res) => {
        this.watchlist = res;
        this.watchlist.forEach(item => this.fetchPrice(item.ticker));
      },
      error: () => {}
    });
  }

  fetchPrice(ticker: string) {
    this.livePrice.getPrice(ticker).subscribe({
      next: (res) => { this.snapshotData[ticker] = res; },
      error: () => { this.snapshotData[ticker] = { error: true }; }
    });
  }

  onTickerInput() {
    const query = this.newTicker.trim();
    if (query.length < 2) { this.suggestions = []; this.showSuggestions = false; return; }
    this.api.searchTickers(query).subscribe({
      next: (res) => { this.suggestions = res.results || []; this.showSuggestions = this.suggestions.length > 0; },
      error: () => { this.suggestions = []; }
    });
  }

  selectSuggestion(s: any) {
    this.newTicker = s.symbol;
    this.suggestions = [];
    this.showSuggestions = false;
    this.addToWatchlist();
  }

  hideSuggestions() {
    setTimeout(() => { this.showSuggestions = false; }, 150);
  }

  addToWatchlist() {
    const t = this.newTicker.trim().toUpperCase();
    if (!t) return;
    this.watchlistError = '';
    this.watchlistService.add(t).subscribe({
      next: (res) => {
        this.watchlist.push(res);
        this.fetchPrice(res.ticker);
        this.newTicker = '';
      },
      error: (err) => { this.watchlistError = err.error?.error || 'Failed to add.'; }
    });
  }

  removeFromWatchlist(item: any) {
    this.watchlistService.remove(item.id).subscribe({
      next: () => { this.watchlist = this.watchlist.filter(w => w.id !== item.id); },
      error: () => {}
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
}