import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartDataset, registerables } from 'chart.js';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { BatchInfoService } from '../../core/services/batch-info.service';
import { BatchInfoRecord } from '../../core/models/logs.models';
import { BatchInfoDialogComponent } from '../logs/batch-info-dialog/batch-info-dialog.component';
import { forkJoin } from 'rxjs';

Chart.register(...registerables);

interface BatchCard {
  batchId: number;
  houseId: number;
  houseName: string;
  batchDate: string;
  deliveryDate: string;
  quantity: number;
  temperature: number;
  humidity: number;
  co2: number;
  nh3: number;
  timeInRangePercent: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('comparisonChart') comparisonChartCanvas!: ElementRef<HTMLCanvasElement>;

  private dashboardService = inject(DashboardService);
  private batchService = inject(BatchInfoService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);
  private router = inject(Router);

  comparisonChart: Chart | null = null;
  allBatches: BatchInfoRecord[] = [];
  batchCards: BatchCard[] = [];

  selectedAggregation = 0;
  selectedSensorType: 'temperature' | 'humidity' | 'co2' | 'nh3' = 'temperature';
  selectedTimeRange: 'day' | 'week' = 'day';

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.refreshCharts();
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  openAddFlockDialog() {
    const ref = this.dialogService.open(BatchInfoDialogComponent, {
      showHeader: false,
      width: '450px',
      modal: true,
      data: null,
    });

    ref?.onClose.subscribe((result) => {
      if (result) {
        this.batchService.createRecord(result).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('COMMON.SUCCESS'),
              detail: this.translate.instant('COMMON.SAVED_SUCCESS'),
            });
            this.loadDashboardData();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('COMMON.ERROR'),
              detail: this.translate.instant('COMMON.MESSAGES.FAILED_CREATE'),
            });
          },
        });
      }
    });
  }

  loadDashboardData() {
    forkJoin({
      batches: this.batchService.getRecords(),
      summaries: this.dashboardService.getAllSummaries(),
    }).subscribe(({ batches, summaries }) => {
      this.allBatches = batches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      this.batchCards = this.allBatches.map((batch) => {
        const summary = summaries.find((s) => s.houseId === batch.houseId);

        const start = new Date(batch.date).getTime();
        const end = new Date(batch.deliveryDate).getTime();
        const now = new Date().getTime();
        let progress = 0;
        const totalDuration = end - start;

        if (totalDuration > 0) {
          progress = ((now - start) / totalDuration) * 100;
          progress = Math.max(0, Math.min(100, progress));
        }

        return {
          batchId: batch.id,
          houseId: batch.houseId,
          houseName: summary ? summary.houseName : batch.houseName || 'Unknown',
          batchDate: batch.date,
          deliveryDate: batch.deliveryDate,
          quantity: batch.quantity,
          temperature: summary ? summary.currentClimate.temperature : 0,
          humidity: summary ? summary.currentClimate.humidity : 0,
          co2: summary ? summary.currentClimate.co2 : 0,
          nh3: summary ? summary.currentClimate.nh3 : 0,
          timeInRangePercent: Math.round(progress),
        };
      });

      this.loadComparisonHistory();
    });
  }

  onCardClick(batchId: number) {
    this.router.navigate(['/flocks'], { queryParams: { batchId: batchId } });
  }

  loadComparisonHistory() {
    const hours = this.selectedTimeRange === 'week' ? 168 : 24;
    const interval = this.selectedTimeRange === 'week' ? 240 : 30;

    this.dashboardService.getComparisonHistory(this.selectedSensorType, hours, interval).subscribe((data) => {
      setTimeout(() => this.updateComparisonChart(data), 0);
    });
  }

  setSensorType(type: 'temperature' | 'humidity' | 'co2' | 'nh3') {
    this.selectedSensorType = type;
    this.loadComparisonHistory();
  }

  setTimeRange(range: 'day' | 'week') {
    this.selectedTimeRange = range;
    this.loadComparisonHistory();
  }

  refreshCharts() {
    this.loadComparisonHistory();
  }

  private getColor(index: number): string {
    const angle = 137.508;
    const hue = (index * angle) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  updateComparisonChart(data: any[]) {
    if (!this.comparisonChartCanvas) return;
    const ctx = this.comparisonChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.comparisonChart) this.comparisonChart.destroy();

    const allTimestamps = new Set<string>();
    data.forEach((house) => {
      house.data.forEach((p: any) => allTimestamps.add(p.timestamp));
    });
    const sortedTimestamps = Array.from(allTimestamps).sort();

    const labels = sortedTimestamps.map((ts) => {
      const date = new Date(ts);
      return this.selectedTimeRange === 'week'
        ? date.toLocaleDateString([], { day: '2-digit', month: '2-digit' }) +
            ' ' +
            date.toLocaleTimeString([], { hour: '2-digit' })
        : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const datasets: ChartDataset<'line'>[] = data.map((house, index) => {
      const dataMap = new Map<string, number>(house.data.map((p: any) => [p.timestamp, p.value]));

      const alignedData: (number | null)[] = sortedTimestamps.map((ts) => {
        const val = dataMap.get(ts);
        return val !== undefined ? val : null;
      });

      const color = this.getColor(index);

      return {
        label: house.houseName,
        data: alignedData,
        borderColor: color,
        backgroundColor: color,
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      };
    });

    this.comparisonChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              boxWidth: 16,
              boxHeight: 16,
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#ffffff',
            titleColor: '#1A1C21',
            bodyColor: '#64748B',
            borderColor: '#F1F5F9',
            borderWidth: 1,
            usePointStyle: true,
            boxPadding: 4,
            callbacks: {
              labelColor: (context) => {
                return {
                  borderColor: context.dataset.borderColor as string,
                  backgroundColor: context.dataset.backgroundColor as string,
                  borderWidth: 2,
                  borderRadius: 2,
                };
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: true, color: '#f8fafc', drawTicks: false },
            ticks: { maxTicksLimit: 8, color: '#94a3b8' },
            border: { display: false },
          },
          y: {
            display: true,
            grid: { display: true, color: '#f1f5f9', tickBorderDash: [4, 4] } as any,
            ticks: { color: '#94a3b8' },
            border: { display: false },
          },
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
      },
    });
  }
}
