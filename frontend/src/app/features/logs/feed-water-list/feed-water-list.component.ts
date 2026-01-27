import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { FeedWaterService } from '../../../core/services/feed-water.service';
import { FeedWaterRecord } from '../../../core/models/logs.models';
import { FeedWaterDialogComponent } from '../feed-water-dialog/feed-water-dialog.component';

@Component({
  selector: 'app-feed-water-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    DatePipe,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Feed & Water Log</h1>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Add Record
        </button>
      </div>

      <table mat-table [dataSource]="dataSource()" class="mat-elevation-z8">
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let element">{{ element.date | date: 'mediumDate' }}</td>
        </ng-container>

        <ng-container matColumnDef="house">
          <th mat-header-cell *matHeaderCellDef>House</th>
          <td mat-cell *matCellDef="let element">{{ element.houseName }}</td>
        </ng-container>

        <ng-container matColumnDef="feed">
          <th mat-header-cell *matHeaderCellDef>Feed Info</th>
          <td mat-cell *matCellDef="let element">
            {{ element.feedName || '-' }} ({{ element.feedQuantityKg }} kg)
          </td>
        </ng-container>

        <ng-container matColumnDef="water">
          <th mat-header-cell *matHeaderCellDef>Water (L)</th>
          <td mat-cell *matCellDef="let element">{{ element.waterQuantityLiters }}</td>
        </ng-container>

        <ng-container matColumnDef="personnel">
          <th mat-header-cell *matHeaderCellDef>Responsible</th>
          <td mat-cell *matCellDef="let element">{{ element.personnelName || '-' }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let element">
            <button mat-icon-button color="warn" (click)="deleteRecord(element.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 0;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      h1 {
        margin: 0;
      }
      table {
        width: 100%;
      }
    `,
  ],
})
export class FeedWaterListComponent implements OnInit {
  private service = inject(FeedWaterService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['date', 'house', 'feed', 'water', 'personnel', 'actions'];
  dataSource = signal<FeedWaterRecord[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getRecords().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.snackBar.open('Error loading records', 'Close', { duration: 3000 }),
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(FeedWaterDialogComponent, { width: '450px' });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.service.createRecord(result).subscribe({
          next: () => {
            this.loadData();
            this.snackBar.open('Saved successfully', 'Close', { duration: 3000 });
          },
          error: () => this.snackBar.open('Error saving record', 'Close', { duration: 3000 }),
        });
      }
    });
  }

  deleteRecord(id: number): void {
    if (confirm('Are you sure?')) {
      this.service.deleteRecord(id).subscribe(() => {
        this.loadData();
        this.snackBar.open('Deleted', 'Close', { duration: 3000 });
      });
    }
  }
}
