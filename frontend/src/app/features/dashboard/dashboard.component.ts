import { Component, inject, OnInit, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MessageService } from 'primeng/api';

import { Chart, registerables } from 'chart.js';

import { DashboardService } from '../../core/services/dashboard.service';
import { HousesService } from '../../core/services/houses.service';
import { DashboardSummary, ClimateHistoryPoint } from '../../core/models/dashboard.models';
import { House } from '../../core/models/master-data.models';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    SelectModule,
    ProgressBarModule,
    TagModule,
    DividerModule,
    SelectButtonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private housesService = inject(HousesService);
  private messageService = inject(MessageService);

  // Signals
  houses = signal<House[]>([]);
  selectedHouseId = signal<number | null>(null);
  summary = signal<DashboardSummary | null>(null);
  isLoading = signal<boolean>(false);

  // Charts
  @ViewChild('climateChart') climateChartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;
  historyData = signal<ClimateHistoryPoint[]>([]);

  // Chart Period Options for SelectButton
  periodOptions = [
    { label: '12h', value: 12 },
    { label: '24h', value: 24 },
    { label: '48h', value: 48 },
  ];
  chartPeriod = signal<number>(24);

  constructor() {}

  ngOnInit(): void {
    this.loadHouses();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  loadHouses(): void {
    this.isLoading.set(true);
    this.housesService.getHouses().subscribe({
      next: (data) => {
        this.houses.set(data);
        if (data.length > 0) {
          this.selectedHouseId.set(data[0].id);
          this.refreshAll();
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.showError('Failed to load houses');
        this.isLoading.set(false);
      },
    });
  }

  onHouseChange(): void {
    // PrimeNG Select emits the value directly or via event, but ngModel binding updates the signal/variable
    // If using (onChange), event.value contains the new value.
    // However, with signals and ngModel, we can just trigger refresh.
    this.refreshAll();
  }

  onPeriodChange(): void {
    const id = this.selectedHouseId();
    if (id) {
      this.loadHistory(id);
    }
  }

  refreshAll(): void {
    const id = this.selectedHouseId();
    if (id) {
      this.loadSummary(id);
      this.loadHistory(id);
    }
  }

  private loadSummary(houseId: number): void {
    this.isLoading.set(true);
    this.dashboardService.getSummary(houseId).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.showError('Failed to load dashboard data');
        this.isLoading.set(false);
      },
    });
  }

  private loadHistory(houseId: number): void {
    this.dashboardService.getHistory(houseId, this.chartPeriod()).subscribe({
      next: (data) => {
        this.historyData.set(data);
        // Timeout to allow canvas to be present in DOM if it was hidden
        setTimeout(() => this.updateChart(), 0);
      },
      error: () => console.error('Failed to load history'),
    });
  }

  private updateChart(): void {
    if (!this.climateChartCanvas) return;

    const data = this.historyData();
    const labels = data.map((d) => {
      const date = new Date(d.timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const temps = data.map((d) => d.temperature);
    const hums = data.map((d) => d.humidity);

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = temps;
      this.chart.data.datasets[1].data = hums;
      this.chart.update();
    } else {
      const ctx = this.climateChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Temperature (°C)',
                data: temps,
                borderColor: '#1976d2', // Primary Blue
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y',
              },
              {
                label: 'Humidity (%)',
                data: hums,
                borderColor: '#4caf50', // Green
                backgroundColor: 'rgba(76, 175, 80, 0)',
                fill: false,
                tension: 0.4,
                yAxisID: 'y1',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: 'Temperature' },
                grid: { color: '#f0f0f0' },
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: { display: true, text: 'Humidity' },
                grid: { drawOnChartArea: false },
              },
              x: {
                grid: { display: false },
              },
            },
          },
        });
      }
    }
  }

  private showError(msg: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 3000 });
  }
}
