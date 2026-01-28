import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FeedWaterService } from '../../../core/services/feed-water.service';
import { FeedWaterRecord } from '../../../core/models/logs.models';
import { FeedWaterDialogComponent } from '../feed-water-dialog/feed-water-dialog.component';

@Component({
  selector: 'app-feed-water-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TranslateModule],
  templateUrl: './feed-water-list.component.html',
})
export class FeedWaterListComponent implements OnInit {
  private service = inject(FeedWaterService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);

  dataSource = signal<FeedWaterRecord[]>([]);

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

  openDialog(record?: FeedWaterRecord) {
    const ref = this.dialogService.open(FeedWaterDialogComponent, {
      showHeader: false,
      width: '500px',
      modal: true,
      data: record || null,
    });

    ref?.onClose.subscribe((result) => {
      if (result) {
        if (record) {
          this.service.updateRecord(record.id, result).subscribe({
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
          this.service.createRecord(result).subscribe({
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

  deleteRecord(id: number) {
    this.confirmationService.confirm({
      message: this.translate.instant('COMMON.CONFIRM_DELETE'),
      header: this.translate.instant('COMMON.DELETE'),
      icon: 'pi pi-exclamation-triangle',
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
  }
}
