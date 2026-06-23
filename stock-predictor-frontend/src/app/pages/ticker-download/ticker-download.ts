import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ticker-download',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticker-download.html'
})
export class TickerDownload {
  downloadUrl = `${environment.apiUrl}/api/tickers/download`;
}