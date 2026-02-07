import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-flock-prod',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div class="bg-white border border-slate-200 p-5 rounded-2xl">
        <div class="text-slate-500 text-xs mb-1">Прирост за сутки</div>
        <div class="text-2xl font-bold text-slate-800">58г</div>
        <div class="text-xs text-slate-400 mt-1">в среднем</div>
      </div>
      <div class="bg-white border border-slate-200 p-5 rounded-2xl">
        <div class="text-slate-500 text-xs mb-1">Индекс продуктивности</div>
        <div class="text-2xl font-bold text-slate-800">420</div>
        <div class="text-xs text-slate-400 mt-1">EPEF</div>
      </div>
      <div class="bg-white border border-slate-200 p-5 rounded-2xl">
        <div class="text-slate-500 text-xs mb-1">Конверсия корма</div>
        <div class="text-2xl font-bold text-slate-800">1.45</div>
        <div class="text-xs text-green-500 mt-1 font-medium">-0.02 к плану</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white border border-slate-200 rounded-[24px] p-6">
        <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i class="pi pi-chart-bar text-blue-500"></i>
          Потребление корма
        </h3>
        <div class="h-[250px] relative">
          <canvas #feedChart></canvas>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-[24px] p-6">
        <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i class="pi pi-chart-line text-green-500"></i>
          Динамика веса
        </h3>
        <div class="h-[250px] relative">
          <canvas #weightChart></canvas>
        </div>
      </div>
    </div>
  `,
})
export class FlockProdComponent implements AfterViewInit {
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
        labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        datasets: [
          {
            label: 'Расход (кг)',
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
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          { label: 'Факт', data: [180, 480, 950, 1500], borderColor: '#3B82F6' },
          { label: 'План', data: [185, 490, 960, 1520], borderColor: '#94A3B8', borderDash: [5, 5] },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }
}
