import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ReportsService } from '../../../core/services/reports.service';
import { ReportMetadata } from '../../../core/models/reports.models';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, TooltipModule],
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss'],
})
export class ReportsListComponent implements OnInit {
  private service = inject(ReportsService);
  private messageService = inject(MessageService);

  dataSource = signal<ReportMetadata[]>([]);
  isGenerating = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading.set(true);
    this.service.getReports().subscribe({
      next: (data) => {
        this.dataSource.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.showError('Failed to load reports');
        this.isLoading.set(false);
      },
    });
  }

  viewReport(report: ReportMetadata): void {
    this.service.downloadReport(report.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.click();
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      },
      error: () => this.showError('Failed to download report file'),
    });
  }

  generateReport(): void {
    if (this.isGenerating()) return;

    this.isGenerating.set(true);
    const today = new Date().toISOString();

    this.service
      .triggerGeneration({
        houseId: 0,
        date: today,
        reportType: 'Daily',
      })
      .subscribe({
        next: () => {
          this.showSuccess('Report generation triggered. Check back in a few seconds.');
          this.isGenerating.set(false);
          // Auto-refresh after delay
          setTimeout(() => this.loadReports(), 3000);
        },
        error: () => {
          this.showError('Failed to trigger generation');
          this.isGenerating.set(false);
        },
      });
  }

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
    switch (status) {
      case 'Success':
        return 'success';
      case 'Failed':
        return 'danger';
      case 'Pending':
        return 'warn';
      default:
        return 'info';
    }
  }

  private showSuccess(message: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
  }

  private showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
  }
}
