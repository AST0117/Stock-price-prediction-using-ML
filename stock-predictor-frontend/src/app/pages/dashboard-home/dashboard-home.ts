import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { LivePriceService } from '../../services/live-price.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.html'
})
export class DashboardHome implements OnInit {
  snapshotTickers = ['AAPL', 'MSFT', 'TCS.NS'];
  snapshotData: { [key: string]: any } = {};

  features = [
    { title: 'Predict Prices', desc: 'Forecast next 7 days using ARIMA, LSTM & Linear Regression', icon: '📈', link: '/dashboard/predictor' },
    { title: 'Live Prices', desc: 'Track real-time prices for your favorite stocks', icon: '💹', link: '/dashboard/live-prices' },
    { title: 'Stock News', desc: 'Latest headlines for any ticker', icon: '📰', link: '/dashboard/news' },
    { title: 'Currency Converter', desc: 'Convert between world currencies instantly', icon: '💱', link: '/dashboard/currency' },
    { title: 'Learn Stocks', desc: 'Understand ARIMA, LSTM, sentiment & more', icon: '🎓', link: '/dashboard/education' },
    { title: 'Download Tickers', desc: 'Get the full NASDAQ ticker list as CSV', icon: '📥', link: '/dashboard/tickers' },
  ];

  constructor(public auth: AuthService, private livePrice: LivePriceService) {}

  ngOnInit() {
    this.snapshotTickers.forEach(t => {
      this.livePrice.getPrice(t).subscribe({
        next: (res) => { this.snapshotData[t] = res; },
        error: () => { this.snapshotData[t] = { error: true }; }
      });
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
}