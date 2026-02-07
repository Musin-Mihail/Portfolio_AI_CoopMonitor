import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-flock-prod',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div class="bg-white border border-slate-200 p-5 rounded-2xl">
        <div class="text-slate-500 text-xs mb-1">{{ 'FLOCKS.PROD.DAILY_GAIN' | translate }}</div>
        <div class="text-2xl font-bold text-slate-800">58г</div>
        <div class="text-xs text-slate-400 mt-1">{{ 'FLOCKS.PROD.AVERAGE' | translate }}</div>
      </div>
      <div class="bg-white border border-slate-200 p-5 rounded-2xl">
        <div class="text-slate-500 text-xs mb-1">{{ 'FLOCKS.PROD.EFFICIENCY_INDEX' | translate }}</div>
        <div class="text-2xl font-bold text-slate-800">420</div>
        <div class="text-xs text-slate-400 mt-1">EPEF</div>
      </div>
      <div class="bg-white border border-slate-200 p-5 rounded-2xl">
        <div class="text-slate-500 text-xs mb-1">{{ 'FLOCKS.PROD.FCR' | translate }}</div>
        <div class="text-2xl font-bold text-slate-800">1.45</div>
        <div class="text-xs text-green-500 mt-1 font-medium">-0.02 {{ 'FLOCKS.PROD.TO_PLAN' | translate }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white border border-slate-200 rounded-[24px] p-6">
        <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i class="pi pi-chart-bar text-blue-500"></i>
          {{ 'FLOCKS.PROD.FEED_INTAKE' | translate }}
        </h3>
        <div class="h-[250px] relative">
          <canvas #feedChart></canvas>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-[24px] p-6">
        <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i class="pi pi-chart-line text-green-500"></i>
          {{ 'FLOCKS.PROD.WEIGHT_DYNAMICS' | translate }}
        </h3>
        <div class="h-[250px] relative">
          <canvas #weightChart></canvas>
        </div>
      </div>
    </div>
  `,
})
export class FlockProdComponent implements AfterViewInit {
  private translate = inject(TranslateService);
  @ViewChild('feedChart') feedCanvas!: ElementRef;
  @ViewChild('weightChart') weightCanvas!: ElementRef;

  ngAfterViewInit() {
    this.initFeedChart();
    this.initWeightChart();
  }

  initFeedChart() {
    new Chart(this.feedCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.translate.instant('FLOCKS.PROD.WEEK_DAYS'),
        datasets: [
          {
            label: this.translate.instant('FLOCKS.PROD.CHART_CONSUMPTION'),
            data: [450, 480, 510, 500, 530, 560, 590],
            backgroundColor: '#22C55E',
            borderRadius: 4,
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }

  initWeightChart() {
    new Chart(this.weightCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.translate.instant('FLOCKS.PROD.WEEKS'),
        datasets: [
          {
            label: this.translate.instant('FLOCKS.PROD.CHART_FACT'),
            data: [180, 480, 950, 1500],
            borderColor: '#3B82F6',
          },
          {
            label: this.translate.instant('FLOCKS.PROD.CHART_PLAN'),
            data: [185, 490, 960, 1520],
            borderColor: '#94A3B8',
            borderDash: [5, 5],
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }
}
