import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartDataset, registerables } from 'chart.js';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { DashboardService } from '../../core/services/dashboard.service';
import { BatchInfoService } from '../../core/services/batch-info.service';
import { DashboardSummary } from '../../core/models/dashboard.models';
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
  imports: [CommonModule, FormsModule, SelectModule, ButtonModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('climateChart') climateChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('comparisonChart') comparisonChartCanvas!: ElementRef<HTMLCanvasElement>;

  private dashboardService = inject(DashboardService);
  private batchService = inject(BatchInfoService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  chart: Chart | null = null;
  comparisonChart: Chart | null = null;

  batchOptions: any[] = [];
  selectedBatchId: number | null = null;

  allBatches: BatchInfoRecord[] = [];

  batchCards: BatchCard[] = [];
  currentSummary: DashboardSummary | null = null;

  selectedAggregation = 0;
  aggregationOptions: { label: string; value: number }[] = [];

  selectedSensorType: 'temperature' | 'humidity' | 'co2' | 'nh3' = 'temperature';
  selectedTimeRange: 'day' | 'week' = 'day';

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.initOptions();
      this.refreshCharts();
    });
  }

  ngOnInit(): void {
    this.initOptions();
    this.loadDashboardData();
  }

  initOptions() {
    this.aggregationOptions = [
      { label: this.translate.instant('DASHBOARD.AGGREGATION.RAW'), value: 0 },
      { label: this.translate.instant('DASHBOARD.AGGREGATION.1MIN'), value: 1 },
      { label: this.translate.instant('DASHBOARD.AGGREGATION.5MIN'), value: 5 },
      { label: this.translate.instant('DASHBOARD.AGGREGATION.30MIN'), value: 30 },
      { label: this.translate.instant('DASHBOARD.AGGREGATION.1HOUR'), value: 60 },
    ];
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

      this.batchOptions = [
        { label: this.translate.instant('DASHBOARD.SELECT_VIEW'), value: null },
        ...this.allBatches.map((b) => ({
          label: `${b.houseName} (${new Date(b.date).toLocaleDateString()})`,
          value: b.id,
          houseId: b.houseId,
        })),
      ];

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

      if (this.selectedBatchId) {
        this.loadDetailData();
      } else {
        this.loadComparisonHistory();
      }
    });
  }

  getSelectedBatch(): BatchInfoRecord | undefined {
    return this.allBatches.find((b) => b.id === this.selectedBatchId);
  }

  onBatchChange() {
    if (this.selectedBatchId) {
      this.loadDetailData();
    } else {
      this.currentSummary = null;
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      this.loadComparisonHistory();
    }
  }

  loadDetailData() {
    const selectedOption = this.batchOptions.find((b) => b.value === this.selectedBatchId);
    const batch = this.allBatches.find((b) => b.id === this.selectedBatchId);

    if (selectedOption && selectedOption.houseId) {
      this.dashboardService.getSummary(selectedOption.houseId).subscribe((res) => {
        this.currentSummary = res;
        if (this.currentSummary) {
          this.currentSummary.houseName = selectedOption.label;

          if (batch) {
            const start = new Date(batch.date).getTime();
            const end = new Date(batch.deliveryDate).getTime();
            const now = new Date().getTime();
            let progress = 0;
            const totalDuration = end - start;

            if (totalDuration > 0) {
              progress = ((now - start) / totalDuration) * 100;
              progress = Math.max(0, Math.min(100, progress));
            }
            this.currentSummary.currentClimate.timeInRangePercent = Math.round(progress);
          }
        }

        if (this.comparisonChart) {
          this.comparisonChart.destroy();
          this.comparisonChart = null;
        }
        this.loadSingleHistory(selectedOption.houseId);
      });
    }
  }

  onAggregationChange() {
    if (this.selectedBatchId) {
      const batch = this.batchOptions.find((b) => b.value === this.selectedBatchId);
      if (batch) this.loadSingleHistory(batch.houseId);
    }
  }

  loadSingleHistory(houseId: number) {
    this.dashboardService.getHistory(houseId, 24, this.selectedAggregation).subscribe((data) => {
      setTimeout(() => this.updateSingleChart(data), 0);
    });
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
    if (this.selectedBatchId) {
      const batch = this.batchOptions.find((b) => b.value === this.selectedBatchId);
      if (batch) this.loadSingleHistory(batch.houseId);
    } else {
      this.loadComparisonHistory();
    }
  }

  private getColor(index: number): string {
    const angle = 137.508;
    const hue = (index * angle) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  updateSingleChart(data: any[] = []) {
    if (!this.climateChartCanvas) return;
    const ctx = this.climateChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) this.chart.destroy();

    const labels = data.map((d) =>
      new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    );

    const gradientGreen = ctx.createLinearGradient(0, 0, 0, 200);
    gradientGreen.addColorStop(0, 'rgba(76, 175, 80, 0.05)');
    gradientGreen.addColorStop(1, 'rgba(76, 175, 80, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: this.translate.instant('DASHBOARD.SENSORS.TEMP') + ' (°C)',
            data: data.map((d) => d.temperature),
            borderColor: '#4CAF50',
            backgroundColor: gradientGreen,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            yAxisID: 'y',
          },
          {
            label: this.translate.instant('DASHBOARD.SENSORS.HUMIDITY') + ' (%)',
            data: data.map((d) => d.humidity),
            borderColor: '#3B82F6',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            yAxisID: 'y',
          },
          {
            label: 'NH3 (ppm)',
            data: data.map((d) => d.nh3),
            borderColor: '#A855F7',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              boxWidth: 16,
              boxHeight: 16,
              generateLabels: (chart) => {
                const original = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                original.forEach((label) => {
                  label.fillStyle = label.strokeStyle;
                  label.lineWidth = 0;
                });
                return original;
              },
            },
          },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } },
          y: { display: true, position: 'left', grid: { display: true, color: '#f1f5f9' } },
          y1: { display: true, position: 'right', grid: { display: false } },
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
      },
    });
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
