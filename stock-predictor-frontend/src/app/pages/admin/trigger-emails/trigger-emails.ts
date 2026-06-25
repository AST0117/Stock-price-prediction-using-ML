import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-trigger-emails',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trigger-emails.html'
})
export class TriggerEmails {
  subject = '';
  body = '';
  target = 'all';
  message = '';
  error = '';
  sending = false;

  constructor(private http: HttpClient) {}
  accuracyMessage = '';
  checkAccuracy() {
    this.http.post<any>(`${environment.apiUrl}/api/accuracy/check`, {}).subscribe({
      next: (res) => { this.accuracyMessage = res.message; },
      error: () => { this.accuracyMessage = 'Failed to run check.'; }
    });
  }

  send() {
    if (!this.subject || !this.body) {
      this.error = 'Subject and body are required.';
      return;
    }
    this.sending = true;
    this.error = '';
    this.message = '';

    this.http.post<any>(`${environment.apiUrl}/api/admin/send-email`, {
      subject: this.subject, body: this.body, target: this.target
    }).subscribe({
      next: (res) => { this.message = res.message; this.sending = false; },
      error: (err) => { this.error = err.error?.error || 'Failed to send.'; this.sending = false; }
    });
  }
}