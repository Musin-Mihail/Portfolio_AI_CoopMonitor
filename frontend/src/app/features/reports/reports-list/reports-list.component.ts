import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReportsService } from '../../../core/services/reports.service';
import { ReportMetadata } from '../../../core/models/reports.models';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss'],
})
export class ReportsListComponent implements OnInit {
  private service = inject(ReportsService);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = [
    'reportDate',
    'reportType',
    'houseName',
    'generatedAt',
    'status',
    'actions',
  ];
  dataSource = signal<ReportMetadata[]>([]);
  isGenerating = signal<boolean>(false);

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.service.getReports().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.showError('Failed to load reports'),
    });
  }

  viewReport(report: ReportMetadata): void {
    this.service.downloadReport(report.id).subscribe({
      next: (blob) => {
        // Create a secure URL for the blob and open it
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // Open in new tab for viewing
        link.target = '_blank';
        // Or if you want to force download:
        // link.download = `${report.reportType}_${report.houseName}_${report.reportDate}.html`;
        link.click();

        // Cleanup after delay
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      },
      error: () => this.showError('Failed to download report file'),
    });
  }

  generateReport(): void {
    if (this.isGenerating()) return;

    this.isGenerating.set(true);
    // Request generation for "yesterday" (standard for daily report) or "today".
    // Let's assume we want to re-run for yesterday or today.
    // Ideally, UI should allow picking date. For MVP, let's trigger for Today.
    const today = new Date().toISOString();

    this.service
      .triggerGeneration({
        houseId: 0, // 0 usually implies 'all' or handled by Job logic
        date: today,
        reportType: 'Daily',
      })
      .subscribe({
        next: () => {
          this.showSuccess('Report generation triggered. Check back in a few seconds.');
          this.isGenerating.set(false);
          // Auto-refresh after a small delay to see the new entry if job is fast
          setTimeout(() => this.loadReports(), 2000);
        },
        error: () => {
          this.showError('Failed to trigger generation');
          this.isGenerating.set(false);
        },
      });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'],
    });
  }
}
