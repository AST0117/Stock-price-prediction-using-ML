import { Component } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  template: `<h2>Welcome, {{ auth.getUser()?.name }} ({{ auth.getUser()?.role }})</h2>`
})
export class DashboardHome {
  constructor(public auth: AuthService) {}
}