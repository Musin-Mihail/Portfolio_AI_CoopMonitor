import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MortalityService } from '../../../core/services/mortality.service';
import { MortalityRecord } from '../../../core/models/logs.models';
import { MortalityDialogComponent } from '../mortality-dialog/mortality-dialog.component';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { LogFilterService } from '../services/log-filter.service'; // Fixed Import

@Component({
  selector: 'app-mortality-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule, TranslateModule],
  templateUrl: './mortality-list.component.html',
})
export class MortalityListComponent implements OnInit {
  private service = inject(MortalityService);
  private filterService = inject(LogFilterService);
  private fileService = inject(FileUploadService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);

  dataSource = signal<MortalityRecord[]>([]);

  constructor() {
    effect(() => {
      this.filterService.houseId();
      this.filterService.startDate();
      this.filterService.endDate();
      this.loadData();
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const houseId = this.filterService.houseId() || undefined;
    const startDate = this.filterService.startDate()?.toISOString();
    const endDate = this.filterService.endDate()?.toISOString();

    this.service.getRecords(houseId, startDate, endDate).subscribe({
      next: (data) => this.dataSource.set(data),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: this.translate.instant('COMMON.LOAD_ERROR'),
        }),
    });
  }

  openDialog(record?: MortalityRecord): void {
    const ref = this.dialogService.open(MortalityDialogComponent, {
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

  viewPhoto(url: string | undefined): void {
    if (!url) return;
    const [bucket, ...rest] = url.split('/');
    window.open(this.fileService.getDownloadUrl(bucket, rest.join('/')), '_blank');
  }
}
