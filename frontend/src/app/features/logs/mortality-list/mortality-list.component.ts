import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { MortalityService } from '../../../core/services/mortality.service';
import { MortalityRecord } from '../../../core/models/logs.models';
import { MortalityDialogComponent } from '../mortality-dialog/mortality-dialog.component';
import { FileUploadService } from '../../../core/services/file-upload.service';

@Component({
  selector: 'app-mortality-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './mortality-list.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class MortalityListComponent implements OnInit {
  private service = inject(MortalityService);
  private fileService = inject(FileUploadService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  dataSource = signal<MortalityRecord[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.getRecords().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.showError('Error loading records'),
    });
  }

  openDialog(): void {
    const ref = this.dialogService.open(MortalityDialogComponent, {
      header: 'Add Mortality Record',
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

  deleteRecord(id: number): void {
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

  viewPhoto(url: string | undefined): void {
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
