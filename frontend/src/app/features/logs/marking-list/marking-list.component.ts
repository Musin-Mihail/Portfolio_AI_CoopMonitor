import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MarkingService } from '../../../core/services/marking.service';
import { MarkingRecord } from '../../../core/models/logs.models';
import { MarkingDialogComponent } from '../marking-dialog/marking-dialog.component';
import { FileUploadService } from '../../../core/services/file-upload.service';

@Component({
  selector: 'app-marking-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './marking-list.component.html',
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
      .badge {
        padding: 4px 8px;
        border-radius: 12px;
        background-color: #e0f7fa;
        color: #006064;
        font-size: 0.8rem;
      }
      .badge.tape {
        background-color: #fff3e0;
        color: #e65100;
      }
    `,
  ],
})
export class MarkingListComponent implements OnInit {
  private service = inject(MarkingService);
  private fileService = inject(FileUploadService); // Inject FileUploadService
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['date', 'house', 'age', 'type', 'details', 'evidence', 'actions'];
  dataSource = signal<MarkingRecord[]>([]);

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
    const dialogRef = this.dialog.open(MarkingDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.service.createRecord(result).subscribe({
          next: () => {
            this.loadRecords();
            this.snackBar.open('Marking recorded successfully', 'Close', { duration: 3000 });
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
    // URL format from backend is "bucket/path/to/file.jpg"
    const parts = relativeUrl.split('/');
    const bucket = parts[0];
    const path = parts.slice(1).join('/');

    // Use the service to generate URL with Token
    return this.fileService.getDownloadUrl(bucket, path);
  }
}
