import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { UserDto } from '../../../core/models/admin.models';
import { UsersService } from '../../../core/services/users.service';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TabsModule],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  private service = inject(UsersService);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  dataSource = signal<UserDto[]>([]);

  ngOnInit(): void {
    this.loadData();
  }
  onTabChange(path: string) {
    this.router.navigate([path]);
  }

  loadData(): void {
    this.service.getUsers().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' }),
    });
  }

  openDialog(): void {
    const ref = this.dialogService.open(UserDialogComponent, { header: 'Create User', width: '400px' });
    ref?.onClose.subscribe((result) => {
      if (result) this.service.createUser(result).subscribe(() => this.loadData());
    });
  }

  deleteUser(id: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure?',
      accept: () => this.service.deleteUser(id).subscribe(() => this.loadData()),
    });
  }
}
