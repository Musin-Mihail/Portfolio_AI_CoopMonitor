import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-flock-prod',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './flock-prod.component.html',
  styleUrl: './flock-prod.component.scss',
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
