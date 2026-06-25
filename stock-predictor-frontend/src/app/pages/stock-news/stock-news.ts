import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
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

  suggestions: any[] = [];
  showSuggestions = false;
  private searchSubject = new Subject<string>();

  constructor(private newsService: NewsService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.newsService.searchTickers(query))
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
    if (!trimmed) return;

    this.showSuggestions = false;
    this.loading = true;
    this.error = '';

    const looksLikeTicker = /^[A-Za-z0-9.\-]{1,10}$/.test(trimmed) && !trimmed.includes(' ');

    if (looksLikeTicker) {
      this.fetchNews(trimmed);
    } else {
      this.newsService.searchTickers(trimmed).subscribe({
        next: (res) => {
          const match = res.results?.[0];
          if (match) {
            this.ticker = match.symbol;
            this.fetchNews(match.symbol);
          } else {
            this.error = `Could not find a ticker for "${trimmed}". Try selecting from the dropdown.`;
            this.loading = false;
          }
        },
        error: () => {
          this.error = 'Could not resolve company name.';
          this.loading = false;
        }
      });
    }
  }

  fetchNews(symbol: string) {
    this.newsService.getNews(symbol).subscribe({
      next: (res) => { this.articles = res.articles; this.loading = false; },
      error: (err) => { this.error = err.error?.error || 'Failed to fetch news.'; this.loading = false; }
    });
  }
}