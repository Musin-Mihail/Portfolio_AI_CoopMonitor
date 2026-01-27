import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { DashboardService } from '../../core/services/dashboard.service';
import { HousesService } from '../../core/services/houses.service';
import { DashboardSummary } from '../../core/models/dashboard.models';
import { House } from '../../core/models/master-data.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  template: `
    <div class="dashboard-container">
      <div class="header-row">
        <h1>Dashboard</h1>
        <div class="controls">
          <mat-form-field
            appearance="outline"
            subscriptSizing="dynamic">
            <mat-label>Select House</mat-label>
            <mat-select
              [value]="selectedHouseId()"
              (selectionChange)="onHouseChange($event.value)"
              [disabled]="houses().length === 0">
              <mat-option
                *ngFor="let house of houses()"
                [value]="house.id">
                {{ house.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <button
            mat-icon-button
            color="primary"
            (click)="refresh()"
            title="Refresh Data">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <div
        class="loading-shade"
        *ngIf="isLoading()">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      </div>

      <ng-container *ngIf="summary() as data">
        <div class="status-row">
          <div class="cycle-info">
            <span class="label">Day of Cycle:</span>
            <span class="value">{{ data.dayOfCycle }}</span>
          </div>

          <div
            class="alerts-container"
            *ngIf="data.activeAlerts.length > 0">
            <mat-chip-set>
              <mat-chip
                *ngFor="let alert of data.activeAlerts"
                color="warn"
                selected
                highlighted>
                <mat-icon matChipAvatar>warning</mat-icon>
                {{ alert }}
              </mat-chip>
            </mat-chip-set>
          </div>
          <div
            class="alerts-container"
            *ngIf="data.activeAlerts.length === 0">
            <mat-chip
              color="accent"
              selected>
              <mat-icon matChipAvatar>check_circle</mat-icon>
              All Systems Normal
            </mat-chip>
          </div>
        </div>

        <div class="grid">
          <mat-card class="dashboard-card climate-card">
            <mat-card-header>
              <mat-icon
                mat-card-avatar
                color="primary">
                thermostat
              </mat-icon>
              <mat-card-title>Climate</mat-card-title>
              <mat-card-subtitle>
                Last Update: {{ data.currentClimate.lastUpdate | date: 'shortTime' }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="metrics-grid">
                <div class="metric-item">
                  <span class="metric-label">Temperature</span>
                  <span class="metric-value">{{ data.currentClimate.temperature | number: '1.1-1' }}°C</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Humidity</span>
                  <span class="metric-value">{{ data.currentClimate.humidity | number: '1.0-0' }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">CO2</span>
                  <span class="metric-value">{{ data.currentClimate.co2 | number: '1.0-0' }} ppm</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">NH3</span>
                  <span class="metric-value">{{ data.currentClimate.nh3 | number: '1.1-1' }} ppm</span>
                </div>
              </div>

              <div class="progress-section">
                <div class="progress-label">
                  <span>Time in Range (24h)</span>
                  <span>{{ data.currentClimate.timeInRangePercent | number: '1.0-0' }}%</span>
                </div>
                <mat-progress-bar
                  mode="determinate"
                  [value]="data.currentClimate.timeInRangePercent"
                  [color]="data.currentClimate.timeInRangePercent > 70 ? 'primary' : 'warn'"></mat-progress-bar>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="dashboard-card audio-card">
            <mat-card-header>
              <mat-icon
                mat-card-avatar
                [class.green-icon]="data.audioStatus.status === 'Healthy'"
                [class.red-icon]="data.audioStatus.status === 'Warning'">
                graphic_eq
              </mat-icon>
              <mat-card-title>Audio & Welfare</mat-card-title>
              <mat-card-subtitle>Status: {{ data.audioStatus.status }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content class="centered-content">
              <div
                class="audio-status-box"
                [class.warning-box]="data.audioStatus.status === 'Warning'">
                <div class="status-icon">
                  <mat-icon *ngIf="data.audioStatus.status === 'Healthy'">check</mat-icon>
                  <mat-icon *ngIf="data.audioStatus.status === 'Warning'">priority_high</mat-icon>
                  <mat-icon *ngIf="data.audioStatus.status === 'Unknown'">question_mark</mat-icon>
                </div>
                <div class="status-label">
                  {{ data.audioStatus.lastClassification || 'No Data' }}
                </div>
              </div>
              <div
                class="sub-text"
                *ngIf="data.audioStatus.lastUpdate && data.audioStatus.status !== 'Unknown'">
                Updated: {{ data.audioStatus.lastUpdate | date: 'mediumTime' }}
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="dashboard-card production-card">
            <mat-card-header>
              <mat-icon
                mat-card-avatar
                class="orange-icon">
                inventory_2
              </mat-icon>
              <mat-card-title>Production (Today)</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="metrics-list">
                <div class="list-item">
                  <span class="item-label">Feed Consumed</span>
                  <span class="item-value">{{ data.todayMetrics.feedConsumedKg | number: '1.1-1' }} kg</span>
                </div>
                <mat-divider></mat-divider>
                <div class="list-item">
                  <span class="item-label">Water Consumed</span>
                  <span class="item-value">{{ data.todayMetrics.waterConsumedLiters | number: '1.1-1' }} L</span>
                </div>
                <mat-divider></mat-divider>
                <div class="list-item">
                  <span class="item-label">Est. ADG (Gain)</span>
                  <span class="item-value">
                    {{
                      data.todayMetrics.estimatedADG ? (data.todayMetrics.estimatedADG | number: '1.1-1') + ' g' : 'N/A'
                    }}
                  </span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="dashboard-card mortality-card">
            <mat-card-header>
              <mat-icon
                mat-card-avatar
                color="warn">
                dangerous
              </mat-icon>
              <mat-card-title>Mortality (Today)</mat-card-title>
            </mat-card-header>
            <mat-card-content class="centered-content">
              <div class="big-number warn-text">
                {{ data.todayMetrics.mortalityCount }}
              </div>
              <div class="sub-text">Birds</div>
              <div class="rate-badge">Rate: {{ data.todayMetrics.mortalityRatePercent | number: '1.2-2' }}%</div>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-container>

      <div
        class="empty-state"
        *ngIf="!summary() && !isLoading()">
        <p *ngIf="houses().length === 0">No houses configured. Go to Settings > Houses.</p>
        <p *ngIf="houses().length > 0">Select a house to view data.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 0;
        max-width: 1200px;
        margin: 0 auto;
      }

      .header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 16px;

        h1 {
          margin: 0;
          font-size: 24px;
        }

        .controls {
          display: flex;
          align-items: center;
          gap: 12px;

          mat-form-field {
            margin-bottom: -1.25em; /* Fix material padding */
            min-width: 200px;
          }
        }
      }

      .loading-shade {
        margin-bottom: 20px;
      }

      .status-row {
        display: flex;
        align-items: center;
        gap: 24px;
        margin-bottom: 24px;
        flex-wrap: wrap;

        .cycle-info {
          background: #e3f2fd;
          padding: 8px 16px;
          border-radius: 20px;
          display: flex;
          gap: 8px;
          align-items: center;
          color: #1565c0;

          .label {
            font-weight: 500;
          }
          .value {
            font-weight: bold;
            font-size: 1.1em;
          }
        }
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
      }

      .dashboard-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      /* Climate Card Styles */
      .metrics-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 24px;

        .metric-item {
          display: flex;
          flex-direction: column;
          background-color: #f5f5f5;
          padding: 12px;
          border-radius: 8px;

          .metric-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          }
          .metric-value {
            font-size: 18px;
            font-weight: 500;
          }
        }
      }

      .progress-section {
        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 6px;
          color: #555;
        }
      }

      /* Production Card Styles */
      .metrics-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .list-item {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;

          .item-label {
            color: #555;
          }
          .item-value {
            font-weight: 500;
          }
        }
      }

      .orange-icon {
        color: #ed6c02;
      }
      .green-icon {
        color: #4caf50;
      }
      .red-icon {
        color: #f44336;
      }

      /* Audio Card Styles */
      .audio-status-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background-color: #e8f5e9;
        border-radius: 50%;
        width: 100px;
        height: 100px;
        margin-bottom: 10px;
        color: #2e7d32;

        &.warning-box {
          background-color: #ffebee;
          color: #c62828;
        }

        .status-icon mat-icon {
          font-size: 40px;
          height: 40px;
          width: 40px;
        }
        .status-label {
          font-weight: bold;
          margin-top: 5px;
        }
      }

      /* Mortality Card Styles */
      .centered-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px 0;
        flex-grow: 1;
      }

      .big-number {
        font-size: 48px;
        font-weight: bold;
        line-height: 1;
        margin-bottom: 8px;
      }

      .warn-text {
        color: #d32f2f;
      }

      .sub-text {
        color: #666;
        margin-bottom: 12px;
      }

      .rate-badge {
        background-color: #ffebee;
        color: #c62828;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }

      .empty-state {
        text-align: center;
        padding: 40px;
        color: #888;
        font-style: italic;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private housesService = inject(HousesService);
  private snackBar = inject(MatSnackBar);

  // Signals
  houses = signal<House[]>([]);
  selectedHouseId = signal<number | null>(null);
  summary = signal<DashboardSummary | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadHouses();
  }

  loadHouses(): void {
    this.isLoading.set(true);
    this.housesService.getHouses().subscribe({
      next: (data) => {
        this.houses.set(data);
        if (data.length > 0) {
          // Default to first house if not selected
          this.selectedHouseId.set(data[0].id);
          this.loadSummary(data[0].id);
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.showError('Failed to load houses');
        this.isLoading.set(false);
      },
    });
  }

  onHouseChange(houseId: number): void {
    this.selectedHouseId.set(houseId);
    this.loadSummary(houseId);
  }

  refresh(): void {
    const id = this.selectedHouseId();
    if (id) {
      this.loadSummary(id);
    } else {
      this.loadHouses();
    }
  }

  private loadSummary(houseId: number): void {
    this.isLoading.set(true);
    this.dashboardService.getSummary(houseId).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.showError('Failed to load dashboard data');
        this.isLoading.set(false);
      },
    });
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
  }
}
