import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartDataset, registerables } from 'chart.js';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { HousesService } from '../../core/services/houses.service';
import { DashboardSummary } from '../../core/models/dashboard.models';

Chart.register(...registerables);

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
  private housesService = inject(HousesService);
  private translate = inject(TranslateService);

  chart: Chart | null = null;
  comparisonChart: Chart | null = null;

  // Список для селектора
  houseOptions: any[] = [];
  selectedHouseId: number | null = null;

  // Данные
  allSummaries: DashboardSummary[] = [];
  currentSummary: DashboardSummary | null = null;

  // Настройки для графика одного курятника
  selectedAggregation = 0;
  aggregationOptions: { label: string; value: number }[] = [];

  // Настройки для общего графика (Comparison)
  selectedSensorType: 'temperature' | 'humidity' | 'co2' | 'nh3' = 'temperature';
  selectedTimeRange: 'day' | 'week' = 'day';

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.initOptions(); // Update options on lang change
      this.refreshCharts();
    });
  }

  ngOnInit(): void {
    this.initOptions();
    this.loadHouses();
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

  loadHouses() {
    this.housesService.getHouses().subscribe((data) => {
      this.houseOptions = [{ name: 'All Houses', id: null }, ...data];
      this.selectedHouseId = null;
      this.loadData();
    });
  }

  onHouseChange() {
    this.loadData();
  }

  onAggregationChange() {
    if (this.selectedHouseId) {
      this.loadSingleHistory();
    }
  }

  // Переключатели для общего графика
  setSensorType(type: 'temperature' | 'humidity' | 'co2' | 'nh3') {
    this.selectedSensorType = type;
    this.loadComparisonHistory();
  }

  setTimeRange(range: 'day' | 'week') {
    this.selectedTimeRange = range;
    this.loadComparisonHistory();
  }

  loadData() {
    if (this.selectedHouseId === null) {
      // Режим "ALL"
      this.dashboardService.getAllSummaries().subscribe((res) => {
        this.allSummaries = res;
        this.currentSummary = null;
        if (this.chart) {
          this.chart.destroy();
          this.chart = null;
        }
        // Загружаем общий график
        this.loadComparisonHistory();
      });
    } else {
      // Режим "Specific"
      this.dashboardService.getSummary(this.selectedHouseId).subscribe((res) => {
        this.currentSummary = res;
        this.allSummaries = [];
        if (this.comparisonChart) {
          this.comparisonChart.destroy();
          this.comparisonChart = null;
        }
        this.loadSingleHistory();
      });
    }
  }

  // График для одного курятника (мульти-осевой: T, H, Gas)
  loadSingleHistory() {
    if (!this.selectedHouseId) return;
    this.dashboardService.getHistory(this.selectedHouseId, 24, this.selectedAggregation).subscribe((data) => {
      setTimeout(() => this.updateSingleChart(data), 0);
    });
  }

  // Общий график сравнения (один параметр для всех домов)
  loadComparisonHistory() {
    const hours = this.selectedTimeRange === 'week' ? 168 : 24;
    // Для недели интервал больше, для дня меньше
    const interval = this.selectedTimeRange === 'week' ? 240 : 30; // 4 часа или 30 мин

    this.dashboardService.getComparisonHistory(this.selectedSensorType, hours, interval).subscribe((data) => {
      setTimeout(() => this.updateComparisonChart(data), 0);
    });
  }

  refreshCharts() {
    if (this.selectedHouseId) this.loadSingleHistory();
    else this.loadComparisonHistory();
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
            yAxisID: 'y1', // Отдельная ось для газов
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true }, tooltip: { mode: 'index', intersect: false } },
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

    // Собираем все уникальные метки времени и сортируем
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

    // Цвета для разных домов
    const colors = ['#4CAF50', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444'];

    const datasets: ChartDataset<'line'>[] = data.map((house, index) => {
      // ИСПРАВЛЕНИЕ: Явная типизация мапы и данных для TS
      const dataMap = new Map<string, number>(house.data.map((p: any) => [p.timestamp, p.value]));

      // Явно указываем, что массив содержит (number | null)
      const alignedData: (number | null)[] = sortedTimestamps.map((ts) => {
        const val = dataMap.get(ts);
        return val !== undefined ? val : null;
      });

      return {
        label: house.houseName,
        data: alignedData,
        borderColor: colors[index % colors.length],
        backgroundColor: 'transparent',
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
          legend: { display: true, position: 'bottom' },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#ffffff',
            titleColor: '#1A1C21',
            bodyColor: '#64748B',
            borderColor: '#F1F5F9',
            borderWidth: 1,
            usePointStyle: true,
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
