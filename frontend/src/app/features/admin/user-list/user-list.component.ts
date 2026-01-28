import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { UserDto } from '../../../core/models/admin.models';
import { UsersService } from '../../../core/services/users.service';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  private service = inject(UsersService);
  private dialog = inject(MatDialog);
  private messageService = inject(MessageService);

  displayedColumns: string[] = ['userName', 'email', 'role', 'personnel', 'actions'];
  dataSource = signal<UserDto[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getUsers().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.showError('Failed to load users (Admin privileges required)'),
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.service.createUser(result).subscribe({
          next: () => {
            this.loadData();
            this.showSuccess('User created successfully');
          },
          error: (err) => {
            console.error(err);
            const msg = err.error?.[0]?.description || 'Failed to create user';
            this.showError(msg);
          },
        });
      }
    });
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.service.deleteUser(id).subscribe({
        next: () => {
          this.loadData();
          this.showSuccess('User deleted');
        },
        error: () => this.showError('Failed to delete user'),
      });
    }
  }

  private showSuccess(message: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
  }

  private showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
  }
}
