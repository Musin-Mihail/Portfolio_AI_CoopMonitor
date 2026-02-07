import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  effect,
  input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Chart } from 'chart.js';
import { DashboardSummary } from '../../../core/models/dashboard.models';

@Component({
  selector: 'app-flock-health',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="border border-slate-200 rounded-2xl p-4 bg-white">
        <div class="flex items-center gap-2 mb-2 text-slate-500 text-sm">
          <i class="pi pi-heart"></i>
          {{ 'FLOCKS.DETAILS.METRICS.MORTALITY' | translate }}
        </div>
        <div class="text-2xl font-bold text-slate-800 mb-1">0,72%</div>
        <div class="text-[10px] text-slate-400">
          <div>{{ 'FLOCKS.DETAILS.METRICS.CYCLE_TOTAL' | translate }}: 180</div>
          <div>{{ 'FLOCKS.DETAILS.METRICS.TODAY' | translate }}: 12</div>
        </div>
      </div>

      <div class="border border-slate-200 rounded-2xl p-4 bg-white">
        <div class="flex items-center gap-2 mb-2 text-slate-500 text-sm">
          <i class="pi pi-filter"></i>
          {{ 'FLOCKS.DETAILS.METRICS.AVG_WEIGHT' | translate }}
        </div>
        <div class="text-2xl font-bold text-slate-800 mb-1">1380 г</div>
        <div class="text-[10px] text-slate-400">
          <div>{{ 'FLOCKS.DETAILS.METRICS.TARGET' | translate }}: 1400г</div>
          <div>{{ 'FLOCKS.DETAILS.METRICS.UNIFORMITY' | translate }}: 88%</div>
        </div>
      </div>

      <div class="border border-slate-200 rounded-2xl p-4 bg-white">
        <div class="flex items-center gap-2 mb-2 text-slate-500 text-sm">
          <i class="pi pi-chart-bar"></i>
          {{ 'FLOCKS.DETAILS.METRICS.FCR' | translate }}
        </div>
        <div class="text-2xl font-bold text-slate-800 mb-1">1.42</div>
        <div class="text-[10px] text-slate-400">
          <div>Standard: 1.45</div>
        </div>
      </div>

      <div class="border border-slate-200 rounded-2xl p-4 bg-white">
        <div class="flex items-center gap-2 mb-2 text-slate-500 text-sm">
          <i class="pi pi-tint"></i>
          {{ 'FLOCKS.DETAILS.METRICS.WATER_FEED' | translate }}
        </div>
        <div class="text-2xl font-bold text-slate-800 mb-1">2,10</div>
        <div class="text-[10px] text-slate-400">
          <div>{{ 'FLOCKS.DETAILS.METRICS.PER_DAY' | translate }}: 3885л</div>
        </div>
      </div>
    </div>

    <div class="border border-slate-200 rounded-[24px] p-6 bg-white">
      <h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        <i class="pi pi-chart-line text-blue-500"></i>
        {{ 'FLOCKS.DETAILS.CHART_TITLE' | translate }}
      </h3>
      <div class="h-[300px] w-full relative">
        <canvas #healthChart></canvas>
      </div>
    </div>
  `,
})
export class FlockHealthComponent implements AfterViewInit, OnDestroy {
  summary = input<DashboardSummary | null>(null);
  @ViewChild('healthChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;
  private translate = inject(TranslateService);

  constructor() {
    effect(() => {
      const data = this.summary();
      if (data && this.chart) {
      }
    });
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() {
    if (this.chart) this.chart.destroy();
  }

  initChart() {
    if (!this.chartCanvas) return;
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = Array.from({ length: 14 }, (_, i) => `${8 + i}:00`);
    const data1 = labels.map(() => 2 + Math.random() * 2);
    const data2 = labels.map(() => 1 + Math.random() * 1.5);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: this.translate.instant('FLOCKS.DETAILS.CHART.MORTALITY_RATE'),
            data: data1,
            borderColor: '#EF4444',
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: this.translate.instant('FLOCKS.DETAILS.CHART.WATER_CONSUMPTION'),
            data: data2,
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
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          y: {
            grid: { color: '#f3f4f6' },
            beginAtZero: true,
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });
  }
}
