import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { DashboardShell } from './layout/dashboard-shell/dashboard-shell';
import { DashboardHome } from './pages/dashboard-home/dashboard-home';
import { PredictorPage } from './pages/predictor-page/predictor-page';
import { UserManagement } from './pages/admin/user-management/user-management';
import { Profile } from './pages/profile/profile';
import { LivePrices } from './pages/live-prices/live-prices';
import { StockNews } from './pages/stock-news/stock-news';
import { CurrencyConverter } from './pages/currency-converter/currency-converter';
import { TickerDownload } from './pages/ticker-download/ticker-download';
import { Education } from './pages/education/education';
import { TriggerEmails } from './pages/admin/trigger-emails/trigger-emails';
import { authGuard, adminGuard } from './core/auth.guard';
import { Landing } from './pages/landing/landing';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: 'dashboard',
    component: DashboardShell,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardHome },
      { path: 'predictor', component: PredictorPage },
      { path: 'live-prices', component: LivePrices },
      { path: 'news', component: StockNews },
      { path: 'currency', component: CurrencyConverter },
      { path: 'tickers', component: TickerDownload },
      { path: 'education', component: Education },
      { path: 'profile', component: Profile },
      { path: 'admin/users', component: UserManagement, canActivate: [adminGuard] },
      { path: 'admin/emails', component: TriggerEmails, canActivate: [adminGuard] },
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];