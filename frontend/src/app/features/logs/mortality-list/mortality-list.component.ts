import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MortalityService } from '../../../core/services/mortality.service';
import { MortalityRecord } from '../../../core/models/logs.models';
import { MortalityDialogComponent } from '../mortality-dialog/mortality-dialog.component';
import { FileUploadService } from '../../../core/services/file-upload.service';

@Component({
  selector: 'app-mortality-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './mortality-list.component.html',
  styleUrls: ['./mortality-list.component.scss'],
})
export class MortalityListComponent implements OnInit {
  private service = inject(MortalityService);
  private fileService = inject(FileUploadService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['date', 'houseName', 'quantity', 'reason', 'photo', 'actions'];
  dataSource = signal<MortalityRecord[]>([]);

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
    const dialogRef = this.dialog.open(MortalityDialogComponent, { width: '400px' });

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

  viewPhoto(url: string | undefined) {
    if (!url) return;
    // URL format from backend is "bucket/path"
    const [bucket, ...rest] = url.split('/');
    const path = rest.join('/');
    const fullUrl = this.fileService.getDownloadUrl(bucket, path);
    window.open(fullUrl, '_blank');
  }
}
