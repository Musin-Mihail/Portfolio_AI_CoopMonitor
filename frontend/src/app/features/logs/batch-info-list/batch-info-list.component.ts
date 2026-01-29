import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BatchInfoService } from '../../../core/services/batch-info.service';
import { BatchInfoRecord } from '../../../core/models/logs.models';
import { BatchInfoDialogComponent } from '../batch-info-dialog/batch-info-dialog.component';

@Component({
  selector: 'app-batch-info-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule, TranslateModule],
  templateUrl: './batch-info-list.component.html',
})
export class BatchInfoListComponent implements OnInit {
  private service = inject(BatchInfoService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);

  dataSource = signal<BatchInfoRecord[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.getRecords().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: this.translate.instant('COMMON.LOAD_ERROR'),
        }),
    });
  }

  openDialog(record?: BatchInfoRecord): void {
    const ref = this.dialogService.open(BatchInfoDialogComponent, {
      showHeader: false,
      width: '450px',
      modal: true,
      data: record || null,
    });

    ref?.onClose.subscribe((res) => {
      if (res) {
        if (record) {
          this.service.updateRecord(record.id, res).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('COMMON.SUCCESS'),
                detail: this.translate.instant('COMMON.UPDATED_SUCCESS'),
              });
              this.loadData();
            },
            error: () =>
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('COMMON.ERROR'),
                detail: this.translate.instant('COMMON.MESSAGES.FAILED_UPDATE'),
              }),
          });
        } else {
          this.service.createRecord(res).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('COMMON.SUCCESS'),
                detail: this.translate.instant('COMMON.SAVED_SUCCESS'),
              });
              this.loadData();
            },
            error: () =>
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('COMMON.ERROR'),
                detail: this.translate.instant('COMMON.MESSAGES.FAILED_CREATE'),
              }),
          });
        }
      }
    });
  }

  deleteRecord(id: number): void {
    this.translate.get('COMMON.CONFIRM_DELETE').subscribe((msg) => {
      this.confirmationService.confirm({
        message: msg,
        accept: () =>
          this.service.deleteRecord(id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('COMMON.SUCCESS'),
                detail: this.translate.instant('COMMON.DELETED_SUCCESS'),
              });
              this.loadData();
            },
            error: () =>
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('COMMON.ERROR'),
                detail: this.translate.instant('COMMON.MESSAGES.FAILED_DELETE'),
              }),
          }),
      });
    });
  }
}
