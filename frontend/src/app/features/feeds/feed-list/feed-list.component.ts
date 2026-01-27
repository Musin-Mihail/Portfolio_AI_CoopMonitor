import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Feed } from '../../../core/models/master-data.models';
import { FeedsService } from '../../../core/services/feeds.service';
import { FeedDialogComponent } from '../feed-dialog/feed-dialog.component';

@Component({
  selector: 'app-feed-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Feeds</h1>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Add Feed
        </button>
      </div>

      <table mat-table [dataSource]="dataSource()" class="mat-elevation-z8">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let element">{{ element.name }}</td>
        </ng-container>

        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef>Type</th>
          <td mat-cell *matCellDef="let element">{{ element.type }}</td>
        </ng-container>

        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef>Description</th>
          <td mat-cell *matCellDef="let element">{{ element.description }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let element">
            <button mat-icon-button color="primary" (click)="openDialog(element)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteFeed(element.id)">
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
export class FeedListComponent implements OnInit {
  private service = inject(FeedsService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['name', 'type', 'description', 'actions'];
  dataSource = signal<Feed[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getFeeds().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.snackBar.open('Error loading feeds', 'Close', { duration: 3000 }),
    });
  }

  openDialog(feed?: Feed): void {
    const dialogRef = this.dialog.open(FeedDialogComponent, {
      width: '400px',
      data: feed || null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (feed) {
          this.service.updateFeed(feed.id, result).subscribe(() => {
            this.loadData();
            this.snackBar.open('Updated successfully', 'Close', { duration: 3000 });
          });
        } else {
          this.service.createFeed(result).subscribe(() => {
            this.loadData();
            this.snackBar.open('Created successfully', 'Close', { duration: 3000 });
          });
        }
      }
    });
  }

  deleteFeed(id: number): void {
    if (confirm('Are you sure?')) {
      this.service.deleteFeed(id).subscribe(() => {
        this.loadData();
        this.snackBar.open('Deleted successfully', 'Close', { duration: 3000 });
      });
    }
  }
}
