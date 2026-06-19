import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsService } from '../../services/news.service';

@Component({
  selector: 'app-stock-news',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-news.html'
})
export class StockNews {
  ticker = '';
  articles: any[] = [];
  loading = false;
  error = '';

  constructor(private newsService: NewsService) {}

  search() {
    const t = this.ticker.trim();
    if (!t) return;
    this.loading = true;
    this.error = '';
    this.newsService.getNews(t).subscribe({
      next: (res) => { this.articles = res.articles; this.loading = false; },
      error: (err) => { this.error = err.error?.error || 'Failed to fetch news.'; this.loading = false; }
    });
  }
}