import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
// Change: Use SelectModule instead of DropdownModule
import { SelectModule } from 'primeng/select';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Change: DropdownModule -> SelectModule
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('climateChart') climateChartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;
  selectedPeriod = 7;

  mockHouses = [
    {
      name: 'House 1',
      temp: '23.5',
      co2: '850',
      nh3: '15',
      timeInRange: 90,
      batchStart: '12.01.2026',
      count: '203',
      batchEnd: '14.02.2026',
    },
    {
      name: 'House 2',
      temp: '23.5',
      co2: '850',
      nh3: '15',
      timeInRange: 90,
      batchStart: '12.01.2026',
      count: '203',
      batchEnd: '14.02.2026',
    },
    {
      name: 'House 3',
      temp: '23.5',
      co2: '850',
      nh3: '15',
      timeInRange: 90,
      batchStart: '12.01.2026',
      count: '203',
      batchEnd: '14.02.2026',
    },
  ];

  ngOnInit(): void {
    setTimeout(() => this.initChart(), 0);
  }

  initChart() {
    if (!this.climateChartCanvas) return;
    const ctx = this.climateChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Сделаем градиент совсем легким, как в макете
    const gradientGreen = ctx.createLinearGradient(0, 0, 0, 200);
    gradientGreen.addColorStop(0, 'rgba(76, 175, 80, 0.1)'); // Меньше прозрачности
    gradientGreen.addColorStop(1, 'rgba(76, 175, 80, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [
          {
            label: 'chic.house 1',
            data: [1.5, 2.0, 1.8, 2.2, 2.8, 2.5],
            borderColor: '#4CAF50',
            backgroundColor: gradientGreen, // Используем легкий градиент
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0, // Убираем точки
            pointHoverRadius: 4,
          },
          {
            label: 'chic.house 2',
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
            label: 'chic.house 3',
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
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#1A1C21',
            bodyColor: '#64748B',
            borderColor: '#E2E8F0',
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            boxWidth: 8,
            boxHeight: 8,
            usePointStyle: true,
          },
        },
        scales: {
          x: {
            grid: { display: true, color: '#f8fafc', drawTicks: false }, // Едва заметная сетка
            ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 0, autoSkip: true },
            border: { display: false },
          },
          y: {
            display: true,
            min: 0,
            max: 6,
            grid: {
              display: true,
              color: '#f1f5f9', // Пунктир можно убрать, сделав сплошную очень светлую линию
              tickBorderDash: [0, 0],
            } as any,
            ticks: { color: '#94a3b8', font: { size: 10 }, stepSize: 1, padding: 10 },
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
