import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { MarkingService } from '../../../core/services/marking.service';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { MarkingRecord } from '../../../core/models/logs.models';
import { MarkingDialogComponent } from '../marking-dialog/marking-dialog.component';

@Component({
  selector: 'app-marking-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule],
  templateUrl: './marking-list.component.html',
})
export class MarkingListComponent implements OnInit {
  private service = inject(MarkingService);
  private fileService = inject(FileUploadService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  dataSource = signal<MarkingRecord[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.getRecords().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error loading records' }),
    });
  }

  openDialog(record?: MarkingRecord) {
    const ref = this.dialogService.open(MarkingDialogComponent, {
      showHeader: false, // Изменено
      width: '500px',
      modal: true,
      data: record || null,
    });

    ref?.onClose.subscribe((result) => {
      if (result) {
        if (record) {
          this.service.updateRecord(record.id, result).subscribe(() => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record updated' });
            this.loadData();
          });
        } else {
          this.service.createRecord(result).subscribe(() => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record created' });
            this.loadData();
          });
        }
      }
    });
  }

  deleteRecord(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure?',
      accept: () => this.service.deleteRecord(id).subscribe(() => this.loadData()),
    });
  }

  viewPhoto(url: string | undefined): void {
    if (!url) return;
    const [bucket, ...rest] = url.split('/');
    const fullUrl = this.fileService.getDownloadUrl(bucket, rest.join('/'));
    window.open(fullUrl, '_blank');
  }
}
