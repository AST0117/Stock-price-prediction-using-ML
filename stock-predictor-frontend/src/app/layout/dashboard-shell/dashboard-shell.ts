import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './dashboard-shell.html'
})
export class DashboardShell {
  currentPageTitle = 'Dashboard';

  pageTitles: { [key: string]: string } = {
    '/dashboard': 'Home',
    '/dashboard/predictor': 'Predict Prices',
    '/dashboard/live-prices': 'Live Prices',
    '/dashboard/news': 'Stock News',
    '/dashboard/currency': 'Currency Converter',
    '/dashboard/education': 'Learn Stocks',
    '/dashboard/tickers': 'Download Tickers',
    '/dashboard/profile': 'My Profile',
    '/dashboard/admin/users': 'Manage Users',
    '/dashboard/admin/emails': 'Trigger Emails'
  };

  constructor(public auth: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentPageTitle = this.pageTitles[e.urlAfterRedirects] || 'Dashboard';
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  getInitials(): string {
    const name = this.auth.getUser()?.name || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }
}