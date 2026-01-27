import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>

      <div class="grid">
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>thermostat</mat-icon>
            <mat-card-title>Climate</mat-card-title>
            <mat-card-subtitle>House 1</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="metric">24.5°C</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>warning</mat-icon>
            <mat-card-title>Alerts</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>No active alerts</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 0;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }
      .metric {
        font-size: 2rem;
        font-weight: 500;
        margin: 10px 0;
      }
    `,
  ],
})
export class DashboardComponent {}
