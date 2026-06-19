import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html'
})
export class Profile implements OnInit {
  form = { name: '', email: '', password: '' };
  error = '';
  success = '';
  loading = false;

  constructor(
    private profileService: ProfileService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.profileService.get().subscribe({
      next: (res) => { this.form.name = res.name; this.form.email = res.email; },
      error: () => { this.error = 'Failed to load profile.'; }
    });
  }

  save() {
    this.error = '';
    this.success = '';
    const payload: any = { name: this.form.name, email: this.form.email };
    if (this.form.password) payload.password = this.form.password;

    this.profileService.update(payload).subscribe({
      next: () => {
        this.success = 'Profile updated successfully.';
        this.form.password = '';
      },
      error: (err) => { this.error = err.error?.error || 'Update failed.'; }
    });
  }

  deleteAccount() {
    if (!confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) return;

    this.profileService.remove().subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => { this.error = err.error?.error || 'Delete failed.'; }
    });
  }
}