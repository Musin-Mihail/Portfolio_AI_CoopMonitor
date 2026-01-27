import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuditService } from '../../../core/services/audit.service';
import { AuditLogDto } from '../../../core/models/admin.models';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './audit-list.component.html',
  styleUrls: ['./audit-list.component.scss'],
})
export class AuditListComponent implements OnInit {
  private service = inject(AuditService);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['timestamp', 'userName', 'action', 'resource', 'details'];
  dataSource = signal<AuditLogDto[]>([]);

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.service.getLogs().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.showError('Failed to load audit logs (Admin only)'),
    });
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
  }
}
