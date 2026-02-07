import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TagModule } from 'primeng/tag';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-flock-env',
  standalone: true,
  imports: [CommonModule, TranslateModule, TagModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-2 text-slate-500 font-medium">
            <i class="pi pi-sun"></i>
            {{ 'FLOCKS.ENV.LIGHTING' | translate }}
          </div>
          <p-tag
            severity="success"
            [value]="'FLOCKS.ENV.STATUS_OK' | translate"
            [rounded]="true"></p-tag>
        </div>
        <div class="mt-4">
          <div class="text-3xl font-bold text-slate-800">16 {{ 'FLOCKS.ENV.HOURS' | translate }}</div>
          <div class="text-sm text-slate-400">{{ 'FLOCKS.ENV.INTENSITY' | translate }}</div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-2 text-slate-500 font-medium">
            <i class="pi pi-spin pi-cog"></i>
            {{ 'FLOCKS.ENV.VENTILATION' | translate }}
          </div>
          <p-tag
            severity="warn"
            [value]="'FLOCKS.ENV.ATTENTION' | translate"
            [rounded]="true"></p-tag>
        </div>
        <div class="mt-4">
          <div class="text-3xl font-bold text-slate-800">12 {{ 'FLOCKS.ENV.HOURS' | translate }}</div>
          <div class="text-sm text-slate-400">{{ 'FLOCKS.ENV.AIR_SPEED' | translate }}</div>
        </div>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-[24px] p-6">
      <h3 class="text-sm font-bold text-slate-800 mb-4">{{ 'FLOCKS.ENV.CHART_TITLE' | translate }}</h3>
      <div class="h-[320px] w-full relative">
        <canvas #envChart></canvas>
      </div>
    </div>
  `,
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
