import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { WeighingService } from '../../../core/services/weighing.service';
import { WeighingRecord } from '../../../core/models/logs.models';
import { WeighingDialogComponent } from '../weighing-dialog/weighing-dialog.component';
import { FileUploadService } from '../../../core/services/file-upload.service';

@Component({
  selector: 'app-weighing-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './weighing-list.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class WeighingListComponent implements OnInit {
  private service = inject(WeighingService);
  private fileService = inject(FileUploadService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  dataSource = signal<WeighingRecord[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.getRecords().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.showError('Error loading records'),
    });
  }

  openDialog() {
    const ref = this.dialogService.open(WeighingDialogComponent, {
      header: 'Add Weighing Record',
      width: '450px',
      modal: true,
      closable: true,
    });

    ref?.onClose.subscribe((result) => {
      if (result) {
        this.service.createRecord(result).subscribe({
          next: () => {
            this.loadData();
            this.showSuccess('Record added successfully');
          },
          error: () => this.showError('Error creating record'),
        });
      }
    });
  }

  deleteRecord(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this record?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.service.deleteRecord(id).subscribe({
          next: () => {
            this.loadData();
            this.showSuccess('Record deleted');
          },
          error: () => this.showError('Error deleting record'),
        });
      },
    });
  }

  viewVideo(url: string | undefined): void {
    if (!url) return;
    const [bucket, ...rest] = url.split('/');
    const path = rest.join('/');
    const fullUrl = this.fileService.getDownloadUrl(bucket, path);
    window.open(fullUrl, '_blank');
  }

  private showSuccess(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
  }

  private showError(msg: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
  }
}
