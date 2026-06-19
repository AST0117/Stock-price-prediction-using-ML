import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { LivePriceService } from '../../services/live-price.service';

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

  constructor(private livePrice: LivePriceService) {}

  addTicker() {
    const t = this.ticker.trim().toUpperCase();
    if (!t || this.trackedTickers.includes(t)) return;

    this.trackedTickers.push(t);
    this.ticker = '';
    this.fetchAll();

    if (!this.pollSub) {
      this.pollSub = interval(15000).subscribe(() => this.fetchAll()); // poll every 15s
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