import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { BatchInfoService } from '../../core/services/batch-info.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { BatchInfoRecord } from '../../core/models/logs.models';
import { DashboardSummary } from '../../core/models/dashboard.models';

Chart.register(...registerables);

type TabType = 'All' | 'Healthy' | 'Warning' | 'Critical';
type SeverityType = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined;

@Component({
  selector: 'app-flocks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TagModule,
    ProgressBarModule,
    SelectModule,
  ],
  templateUrl: './flocks.component.html',
  styleUrls: ['./flocks.component.scss'],
})
export class FlocksComponent implements OnInit {
  private batchService = inject(BatchInfoService);
  private dashboardService = inject(DashboardService);
  public translate = inject(TranslateService);

  batches = signal<BatchInfoRecord[]>([]);
  selectedBatch = signal<BatchInfoRecord | null>(null);
  selectedBatchSummary = signal<DashboardSummary | null>(null);

  searchQuery = signal<string>('');

  readonly tabs: TabType[] = ['All', 'Healthy', 'Warning', 'Critical'];
  activeTab = signal<TabType>('All');

  readonly detailTabs = ['Health', 'Env', 'Prod', 'Predict', 'Alerts'];
  detailsTab = signal<string>('Health');

  @ViewChild('growthChart') growthChartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.batchService.getRecords().subscribe((data) => {
      const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.batches.set(sorted);

      if (sorted.length > 0) {
        this.selectBatch(sorted[0]);
      }
    });
  }

  selectBatch(batch: BatchInfoRecord) {
    this.selectedBatch.set(batch);

    this.dashboardService.getSummary(batch.houseId).subscribe((summary) => {
      const start = new Date(batch.date).getTime();
      const end = new Date(batch.deliveryDate).getTime();
      const now = new Date().getTime();
      let progress = 0;
      const totalDuration = end - start;

      if (totalDuration > 0) {
        progress = ((now - start) / totalDuration) * 100;
        progress = Math.max(0, Math.min(100, progress));
      }

      if (summary && summary.currentClimate) {
        summary.currentClimate.timeInRangePercent = Math.round(progress);
      }

      this.selectedBatchSummary.set(summary);
      setTimeout(() => this.initChart(), 100);
    });
  }

  get filteredBatches() {
    let result = this.batches();

    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      result = result.filter((b) => b.houseName?.toLowerCase().includes(q) || b.id.toString().includes(q));
    }

    if (this.activeTab() !== 'All') {
      if (this.activeTab() === 'Healthy') {
        result = result.filter((b) => this.getStatus(b) === 'Healthy');
      } else if (this.activeTab() === 'Warning') {
        result = result.filter((b) => this.getStatus(b) === 'Warning');
      } else if (this.activeTab() === 'Critical') {
        result = result.filter((b) => this.getStatus(b) === 'Critical');
      }
    }

    return result;
  }

  getDaysLeft(deliveryDate: string): number {
    const end = new Date(deliveryDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  getStatus(batch: BatchInfoRecord): 'Healthy' | 'Warning' | 'Critical' {
    if (batch.id % 5 === 0) return 'Critical';
    if (batch.id % 3 === 0) return 'Warning';
    return 'Healthy';
  }

  getSeverity(status: string): SeverityType {
    switch (status) {
      case 'Healthy':
        return 'success';
      case 'Warning':
        return 'warn';
      case 'Critical':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  initChart() {
    if (this.chart) this.chart.destroy();
    if (!this.growthChartCanvas) return;

    const ctx = this.growthChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = Array.from({ length: 14 }, (_, i) => `${8 + i}:00`);
    const data1 = labels.map(() => 2 + Math.random() * 2);
    const data2 = labels.map(() => 1 + Math.random() * 1.5);
    const data3 = labels.map(() => 0.5 + Math.random());

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'chic.house 1',
            data: data1,
            borderColor: '#22C55E',
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: 'chic.house 2',
            data: data2,
            borderColor: '#A855F7',
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: 'chic.house 3',
            data: data3,
            borderColor: '#3B82F6',
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, boxWidth: 8 },
          },
        },
        scales: {
          y: {
            grid: { color: '#f3f4f6' },
            border: { dash: [4, 4], display: false },
            beginAtZero: true,
          },
          x: {
            grid: { display: false },
            border: { display: false },
          },
        },
      },
    });
  }
}
