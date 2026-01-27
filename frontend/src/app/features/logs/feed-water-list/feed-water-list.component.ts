import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './feed-water-list.component.html',
  styleUrls: ['./feed-water-list.component.scss'],
})
export class FeedWaterListComponent implements OnInit {
  private service = inject(FeedWaterService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['date', 'houseName', 'feedName', 'feedQty', 'waterQty', 'actions'];
  dataSource = signal<FeedWaterRecord[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.getRecords().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.snackBar.open('Error loading records', 'Close', { duration: 3000 }),
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(FeedWaterDialogComponent, { width: '450px' });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.service.createRecord(result).subscribe({
          next: () => {
            this.loadData();
            this.snackBar.open('Record added', 'Close', { duration: 3000 });
          },
          error: () => this.snackBar.open('Error creating record', 'Close', { duration: 3000 }),
        });
      }
    });
  }

  deleteRecord(id: number) {
    if (confirm('Delete record?')) {
      this.service.deleteRecord(id).subscribe({
        next: () => {
          this.loadData();
          this.snackBar.open('Deleted', 'Close', { duration: 3000 });
        },
      });
    }
  }
}
