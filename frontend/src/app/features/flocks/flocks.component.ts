import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { BatchInfoService } from '../../core/services/batch-info.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { BatchInfoRecord } from '../../core/models/logs.models';
import { DashboardSummary } from '../../core/models/dashboard.models';
import { FlockHealthComponent } from './flock-health/flock-health.component';
import { FlockEnvComponent } from './flock-env/flock-env.component';
import { FlockProdComponent } from './flock-prod/flock-prod.component';
import { FlockPredictComponent } from './flock-predict/flock-predict.component';
import { FlockAlertsComponent } from './flock-alerts/flock-alerts.component';

@Component({
  selector: 'app-flocks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TagModule,
    FlockHealthComponent,
    FlockEnvComponent,
    FlockProdComponent,
    FlockPredictComponent,
    FlockAlertsComponent,
  ],
  templateUrl: './flocks.component.html',
  styleUrls: ['./flocks.component.scss'],
})
export class FlocksComponent implements OnInit {
  private batchService = inject(BatchInfoService);
  private dashboardService = inject(DashboardService);
  public translate = inject(TranslateService);

  batches = signal<BatchInfoRecord[]>([]);
  selectedBatch = signal<BatchInfoRecord | null>(null);
  selectedBatchSummary = signal<DashboardSummary | null>(null);
  searchQuery = signal<string>('');

  readonly tabs = ['All', 'Healthy', 'Warning', 'Critical'] as const;
  activeTab = signal<(typeof this.tabs)[number]>('All');

  readonly detailTabs = ['Health', 'Env', 'Prod', 'Predict', 'Alerts'];
  detailsTab = signal<string>('Health');

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.batchService.getRecords().subscribe((data) => {
      const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.batches.set(sorted);
      if (sorted.length > 0) this.selectBatch(sorted[0]);
    });
  }

  selectBatch(batch: BatchInfoRecord) {
    this.selectedBatch.set(batch);

    this.dashboardService.getSummary(batch.houseId).subscribe((summary) => {
      const start = new Date(batch.date).getTime();
      const end = new Date(batch.deliveryDate).getTime();
      const now = new Date().getTime();
      const total = end - start;
      let progress = total > 0 ? ((now - start) / total) * 100 : 0;

      if (summary && summary.currentClimate) {
        summary.currentClimate.timeInRangePercent = Math.round(Math.max(0, Math.min(100, progress)));
      }
      this.selectedBatchSummary.set(summary);
    });
  }

  get filteredBatches() {
    let result = this.batches();
    const q = this.searchQuery().toLowerCase();

    if (q) {
      result = result.filter((b) => b.houseName?.toLowerCase().includes(q) || b.id.toString().includes(q));
    }

    if (this.activeTab() !== 'All') {
      result = result.filter((b) => this.getStatus(b) === this.activeTab());
    }
    return result;
  }

  getDaysLeft(deliveryDate: string): number {
    const end = new Date(deliveryDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24));
  }

  getStatus(batch: BatchInfoRecord): 'Healthy' | 'Warning' | 'Critical' {
    if (batch.id % 5 === 0) return 'Critical';
    if (batch.id % 3 === 0) return 'Warning';
    return 'Healthy';
  }

  getSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'Healthy':
        return 'success';
      case 'Warning':
        return 'warn';
      case 'Critical':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
