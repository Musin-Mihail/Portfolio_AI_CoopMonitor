import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WeighingService } from '../../../core/services/weighing.service';
import { WeighingRecord } from '../../../core/models/logs.models';
import { WeighingDialogComponent } from '../weighing-dialog/weighing-dialog.component';

@Component({
  selector: 'app-weighing-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './weighing-list.component.html',
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
      .no-records {
        padding: 20px;
        text-align: center;
        color: gray;
      }
    `,
  ],
})
export class WeighingListComponent implements OnInit {
  private service = inject(WeighingService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['date', 'house', 'weight', 'music', 'personnel', 'evidence', 'actions'];
  dataSource = signal<WeighingRecord[]>([]);

  ngOnInit() {
    this.loadRecords();
  }

  loadRecords() {
    this.service.getRecords().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.snackBar.open('Error loading records', 'Close', { duration: 3000 }),
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(WeighingDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.service.createRecord(result).subscribe({
          next: () => {
            this.loadRecords();
            this.snackBar.open('Weighing recorded successfully', 'Close', { duration: 3000 });
          },
          error: () => this.snackBar.open('Failed to create record', 'Close', { duration: 3000 }),
        });
      }
    });
  }

  deleteRecord(id: number) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.service.deleteRecord(id).subscribe({
        next: () => {
          this.loadRecords();
          this.snackBar.open('Deleted successfully', 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('Error deleting record', 'Close', { duration: 3000 }),
      });
    }
  }

  getDownloadUrl(relativeUrl: string): string {
    // Backend stores "bucket/filename". We need to call API proxy.
    // Assuming relativeUrl is "user-uploads/xxx.mp4"
    const parts = relativeUrl.split('/');
    const bucket = parts[0];
    const path = parts.slice(1).join('/');
    return `/api/Files/download/${bucket}/${path}`;
  }
}
