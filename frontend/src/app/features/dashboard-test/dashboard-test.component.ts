import { Component, ElementRef, OnInit, ViewChild, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { SelectModule } from 'primeng/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-test',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, TranslateModule],
  templateUrl: './dashboard-test.component.html',
  styleUrls: ['./dashboard-test.component.scss'],
})
export class DashboardComponentTest implements OnInit {
  @ViewChild('climateChart') climateChartCanvas!: ElementRef<HTMLCanvasElement>;
  private translate = inject(TranslateService);

  chart: Chart | null = null;
  selectedPeriod = 7;

  mockHouses = [
    {
      nameKey: 'DASHBOARD.HOUSE_1',
      temp: '23.5',
      co2: '850',
      nh3: '15',
      timeInRange: 90,
      batchStart: '12.01.2026',
      count: '203',
      batchEnd: '14.02.2026',
    },
    {
      nameKey: 'DASHBOARD.HOUSE_2',
      temp: '23.5',
      co2: '850',
      nh3: '15',
      timeInRange: 90,
      batchStart: '12.01.2026',
      count: '203',
      batchEnd: '14.02.2026',
    },
    {
      nameKey: 'DASHBOARD.HOUSE_3',
      temp: '23.5',
      co2: '850',
      nh3: '15',
      timeInRange: 90,
      batchStart: '12.01.2026',
      count: '203',
      batchEnd: '14.02.2026',
    },
  ];

  calendarDays: string[] = [];

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.initChart();
      this.initCalendar();
    });
  }

  ngOnInit(): void {
    this.initCalendar();
    setTimeout(() => this.initChart(), 0);
  }

  initCalendar() {
    this.translate.get('DASHBOARD.CALENDAR.DAYS').subscribe((days: string[]) => {
      this.calendarDays = days;
    });
  }

  initChart() {
    if (!this.climateChartCanvas) return;
    const ctx = this.climateChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labelHouse1 = this.translate.instant('DASHBOARD.HOUSE_1');
    const labelHouse2 = this.translate.instant('DASHBOARD.HOUSE_2');
    const labelHouse3 = this.translate.instant('DASHBOARD.HOUSE_3');

    const gradientGreen = ctx.createLinearGradient(0, 0, 0, 200);
    gradientGreen.addColorStop(0, 'rgba(76, 175, 80, 0.05)');
    gradientGreen.addColorStop(1, 'rgba(76, 175, 80, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [
          {
            label: labelHouse1,
            data: [1.5, 2.0, 1.8, 2.2, 2.8, 2.5],
            borderColor: '#4CAF50',
            backgroundColor: gradientGreen,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointBackgroundColor: '#ffffff',
            pointBorderWidth: 2,
          },
          {
            label: labelHouse2,
            data: [1.2, 1.4, 1.6, 1.8, 2.0, 1.8],
            borderColor: '#A855F7',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
          {
            label: labelHouse3,
            data: [0.8, 1.0, 1.2, 1.5, 1.7, 1.6],
            borderColor: '#3B82F6',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#ffffff',
            titleColor: '#1A1C21',
            bodyColor: '#64748B',
            borderColor: '#F1F5F9',
            borderWidth: 1,
            padding: 12,
            boxWidth: 8,
            boxHeight: 8,
            usePointStyle: true,
            callbacks: {
              labelColor: function (context) {
                return {
                  borderColor: context.dataset.borderColor as string,
                  backgroundColor: context.dataset.borderColor as string,
                  borderWidth: 0,
                  borderRadius: 2,
                };
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: true, color: '#f8fafc', drawTicks: false },
            ticks: { color: '#94a3b8', font: { size: 10, family: 'Inter' } },
            border: { display: false },
          },
          y: {
            display: true,
            min: 0,
            max: 6,
            grid: {
              display: true,
              color: '#f1f5f9',
              tickBorderDash: [4, 4],
            } as any,
            ticks: { color: '#94a3b8', font: { size: 10, family: 'Inter' }, stepSize: 1, padding: 10 },
            border: { display: false },
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
