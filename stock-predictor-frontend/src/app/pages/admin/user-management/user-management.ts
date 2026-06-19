import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html'
})
export class UserManagement implements OnInit {
  users: any[] = [];
  error = '';
  loading = false;

  showForm = false;
  editingUser: any = null;
  form = { name: '', email: '', password: '', role: 'user' };

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.usersService.getAll().subscribe({
      next: (res) => { this.users = res; this.loading = false; },
      error: (err) => { this.error = 'Failed to load users.'; this.loading = false; }
    });
  }

  openCreate() {
    this.editingUser = null;
    this.form = { name: '', email: '', password: '', role: 'user' };
    this.showForm = true;
  }

  openEdit(user: any) {
    this.editingUser = user;
    this.form = { name: user.name, email: user.email, password: '', role: user.role };
    this.showForm = true;
  }

  save() {
    this.error = '';
    if (this.editingUser) {
      const payload: any = { name: this.form.name, email: this.form.email, role: this.form.role };
      if (this.form.password) payload.password = this.form.password;
      this.usersService.update(this.editingUser.id, payload).subscribe({
        next: () => { this.showForm = false; this.load(); },
        error: (err) => { this.error = err.error?.error || 'Update failed.'; }
      });
    } else {
      this.usersService.create(this.form).subscribe({
        next: () => { this.showForm = false; this.load(); },
        error: (err) => { this.error = err.error?.error || 'Create failed.'; }
      });
    }
  }

  remove(user: any) {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    this.usersService.delete(user.id).subscribe({
      next: () => this.load(),
      error: (err) => { this.error = err.error?.error || 'Delete failed.'; }
    });
  }

  cancel() {
    this.showForm = false;
  }
}