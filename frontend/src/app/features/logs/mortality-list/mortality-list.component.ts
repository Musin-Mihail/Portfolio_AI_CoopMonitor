import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { MortalityService } from '../../../core/services/mortality.service';
import { MortalityRecord } from '../../../core/models/logs.models';
import { MortalityDialogComponent } from '../mortality-dialog/mortality-dialog.component';
import { FileUploadService } from '../../../core/services/file-upload.service';

@Component({
  selector: 'app-mortality-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule],
  templateUrl: './mortality-list.component.html',
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
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error loading records' }),
    });
  }

  openDialog(record?: MortalityRecord): void {
    const ref = this.dialogService.open(MortalityDialogComponent, {
      header: record ? 'Edit Mortality Record' : 'Add Mortality Record',
      width: '450px',
      modal: true,
      data: record || null,
    });

    ref?.onClose.subscribe((res) => {
      if (res) {
        if (record) {
          this.service.updateRecord(record.id, res).subscribe(() => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record updated' });
            this.loadData();
          });
        } else {
          this.service.createRecord(res).subscribe(() => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record created' });
            this.loadData();
          });
        }
      }
    });
  }

  deleteRecord(id: number): void {
    this.confirmationService.confirm({
      message: 'Delete record?',
      accept: () => this.service.deleteRecord(id).subscribe(() => this.loadData()),
    });
  }

  viewPhoto(url: string | undefined): void {
    if (!url) return;
    const [bucket, ...rest] = url.split('/');
    window.open(this.fileService.getDownloadUrl(bucket, rest.join('/')), '_blank');
  }
}
