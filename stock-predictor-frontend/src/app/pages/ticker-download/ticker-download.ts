import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ticker-download',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticker-download.html'
})
export class TickerDownload {
  downloadUrl = 'http://localhost:5000/api/tickers/download';
}