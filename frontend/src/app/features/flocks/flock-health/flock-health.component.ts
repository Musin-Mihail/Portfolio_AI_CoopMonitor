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
  templateUrl: './flock-health.component.html',
  styleUrl: './flock-health.component.scss',
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
