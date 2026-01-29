import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { SelectModule } from 'primeng/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { HousesService } from '../../core/services/houses.service';
import { House } from '../../core/models/master-data.models';
import { DashboardSummary } from '../../core/models/dashboard.models';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('climateChart') climateChartCanvas!: ElementRef<HTMLCanvasElement>;

  private dashboardService = inject(DashboardService);
  private housesService = inject(HousesService);
  private translate = inject(TranslateService);

  chart: Chart | null = null;

  // Список для селектора (с опцией ALL)
  houseOptions: any[] = [];
  selectedHouseId: number | null = null; // null означает "All Houses"

  // Данные
  allSummaries: DashboardSummary[] = []; // Для режима "All"
  currentSummary: DashboardSummary | null = null; // Для режима "Specific"

  // Агрегация (для детального просмотра)
  selectedAggregation = 0;
  aggregationOptions = [
    { label: 'Raw Data', value: 0 },
    { label: '1 Minute Avg', value: 1 },
    { label: '5 Minutes Avg', value: 5 },
    { label: '30 Minutes Avg', value: 30 },
    { label: '1 Hour Avg', value: 60 },
  ];

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      if (this.selectedHouseId) this.updateChart();
    });
  }

  ngOnInit(): void {
    this.loadHouses();
  }

  loadHouses() {
    this.housesService.getHouses().subscribe((data) => {
      // Формируем опции для селектора: сначала "ALL", потом реальные дома
      this.houseOptions = [{ name: 'All Houses', id: null }, ...data];

      // По умолчанию выбираем "All"
      this.selectedHouseId = null;
      this.loadData();
    });
  }

  onHouseChange() {
    this.loadData();
  }

  onAggregationChange() {
    if (this.selectedHouseId) {
      this.loadHistory();
    }
  }

  loadData() {
    if (this.selectedHouseId === null) {
      // Режим "ALL": Грузим список всех карточек
      this.dashboardService.getAllSummaries().subscribe((res) => {
        this.allSummaries = res;
        this.currentSummary = null;
        if (this.chart) {
          this.chart.destroy();
          this.chart = null;
        }
      });
    } else {
      // Режим "Specific": Грузим одну карточку и график
      this.dashboardService.getSummary(this.selectedHouseId).subscribe((res) => {
        this.currentSummary = res;
        this.allSummaries = [];
      });
      this.loadHistory();
    }
  }

  loadHistory() {
    if (!this.selectedHouseId) return;

    this.dashboardService.getHistory(this.selectedHouseId, 24, this.selectedAggregation).subscribe((data) => {
      // Небольшой таймаут, чтобы Canvas успел отрендериться (ngIf)
      setTimeout(() => this.updateChart(data), 0);
    });
  }

  updateChart(data: any[] = []) {
    if (!this.climateChartCanvas) return;
    const ctx = this.climateChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = data.map((d) =>
      new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    );
    const tempData = data.map((d) => d.temperature);
    const humData = data.map((d) => d.humidity);
    const nh3Data = data.map((d) => d.nh3);

    const gradientGreen = ctx.createLinearGradient(0, 0, 0, 200);
    gradientGreen.addColorStop(0, 'rgba(76, 175, 80, 0.05)');
    gradientGreen.addColorStop(1, 'rgba(76, 175, 80, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Temperature (°C)',
            data: tempData,
            borderColor: '#4CAF50',
            backgroundColor: gradientGreen,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: data.length > 100 ? 0 : 2,
            yAxisID: 'y',
          },
          {
            label: 'Humidity (%)',
            data: humData,
            borderColor: '#3B82F6',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: data.length > 100 ? 0 : 2,
            yAxisID: 'y',
          },
          {
            label: 'NH3 (ppm)',
            data: nh3Data,
            borderColor: '#A855F7',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: data.length > 100 ? 0 : 2,
            yAxisID: 'y',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 10 },
          },
          y: {
            display: true,
            grid: { display: true, color: '#f1f5f9' },
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
      },
    });
  }
}
