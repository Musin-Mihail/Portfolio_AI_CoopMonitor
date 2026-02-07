import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
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
            Освещение
          </div>
          <p-tag
            severity="success"
            value="OK"
            [rounded]="true"></p-tag>
        </div>
        <div class="mt-4">
          <div class="text-3xl font-bold text-slate-800">16 ч</div>
          <div class="text-sm text-slate-400">Интенсивность: 5 люкс</div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-2 text-slate-500 font-medium">
            <i class="pi pi-spin pi-cog"></i>
            Вентиляция
          </div>
          <p-tag
            severity="warn"
            value="Внимание"
            [rounded]="true"></p-tag>
        </div>
        <div class="mt-4">
          <div class="text-3xl font-bold text-slate-800">12 ч</div>
          <div class="text-sm text-slate-400">Скорость воздуха: 1.8 м/с</div>
        </div>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-[24px] p-6">
      <h3 class="text-sm font-bold text-slate-800 mb-4">Динамика параметров за 24 часа</h3>
      <div class="h-[320px] w-full relative">
        <canvas #envChart></canvas>
      </div>
    </div>
  `,
})
export class FlockEnvComponent implements AfterViewInit, OnDestroy {
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
          { label: 'Температура', data: [23, 22.5, 23.5, 24.5, 24, 23], borderColor: '#A855F7', tension: 0.4 },
          { label: 'Влажность', data: [55, 58, 60, 52, 50, 55], borderColor: '#3B82F6', tension: 0.4 },
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
