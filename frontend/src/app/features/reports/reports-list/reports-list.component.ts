import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReportsService } from '../../../core/services/reports.service';
import { ReportMetadata } from '../../../core/models/reports.models';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, TooltipModule, TranslateModule],
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss'],
})
export class ReportsListComponent implements OnInit {
  private service = inject(ReportsService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

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
        this.showError(this.translate.instant('COMMON.ERROR'));
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
      error: () => this.showError(this.translate.instant('COMMON.ERROR')),
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
          this.showSuccess(this.translate.instant('REPORTS_PAGE.MSG_TRIGGERED'));
          this.isGenerating.set(false);
          setTimeout(() => this.loadReports(), 3000);
        },
        error: () => {
          this.showError(this.translate.instant('REPORTS_PAGE.MSG_FAILED'));
          this.isGenerating.set(false);
        },
      });
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('COMMON.SUCCESS'),
      detail: message,
      life: 3000,
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('COMMON.ERROR'),
      detail: message,
      life: 3000,
    });
  }
}
