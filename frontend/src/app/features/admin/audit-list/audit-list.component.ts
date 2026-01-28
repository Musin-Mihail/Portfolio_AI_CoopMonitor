import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { AuditService } from '../../../core/services/audit.service';
import { AuditLogDto } from '../../../core/models/admin.models';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './audit-list.component.html',
})
export class AuditListComponent implements OnInit {
  private service = inject(AuditService);
  private messageService = inject(MessageService);

  dataSource = signal<AuditLogDto[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading.set(true);
    this.service.getLogs().subscribe({
      next: (data) => {
        this.dataSource.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load logs' });
        this.isLoading.set(false);
      },
    });
  }
}
