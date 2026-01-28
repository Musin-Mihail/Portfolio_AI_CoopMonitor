import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { UserDto } from '../../../core/models/admin.models';
import { UsersService } from '../../../core/services/users.service';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  private service = inject(UsersService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  dataSource = signal<UserDto[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getUsers().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.showError('Failed to load users (Admin only)'),
    });
  }

  openDialog(): void {
    const ref = this.dialogService.open(UserDialogComponent, {
      header: 'Create User',
      width: '400px',
    });

    ref?.onClose.subscribe((result) => {
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
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this user?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.service.deleteUser(id).subscribe({
          next: () => {
            this.loadData();
            this.showSuccess('User deleted');
          },
          error: () => this.showError('Failed to delete user'),
        });
      },
    });
  }

  private showSuccess(message: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

  private showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }
}
