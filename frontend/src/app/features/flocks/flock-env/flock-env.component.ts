import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TagModule } from 'primeng/tag';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-flock-env',
  standalone: true,
  imports: [CommonModule, TranslateModule, TagModule],
  templateUrl: './flock-env.component.html',
  styleUrl: './flock-env.component.scss',
})
export class FlockEnvComponent implements AfterViewInit, OnDestroy {
  private translate = inject(TranslateService);
  @ViewChild('envChart') chartCanvas!: ElementRef;
  chart: Chart | null = null;

  ngAfterViewInit() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    const labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: this.translate.instant('FLOCKS.ENV.CHART_TEMP'),
            data: [23, 22.5, 23.5, 24.5, 24, 23],
            borderColor: '#A855F7',
            tension: 0.4,
          },
          {
            label: this.translate.instant('FLOCKS.ENV.CHART_HUM'),
            data: [55, 58, 60, 52, 50, 55],
            borderColor: '#3B82F6',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: false } },
      },
    });
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }
}
