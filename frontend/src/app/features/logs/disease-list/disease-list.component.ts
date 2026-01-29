import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DiseaseService } from '../../../core/services/disease.service';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { DiseaseRecord } from '../../../core/models/logs.models';
import { DiseaseDialogComponent } from '../disease-dialog/disease-dialog.component';
import { LogFilterService } from '../services/log-filter.service'; // Fixed Import

@Component({
  selector: 'app-disease-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule, TranslateModule],
  templateUrl: './disease-list.component.html',
})
export class DiseaseListComponent implements OnInit {
  private service = inject(DiseaseService);
  private filterService = inject(LogFilterService);
  private fileService = inject(FileUploadService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);

  dataSource = signal<DiseaseRecord[]>([]);

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

  openDialog(record?: DiseaseRecord) {
    const ref = this.dialogService.open(DiseaseDialogComponent, {
      showHeader: false,
      width: '450px',
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

  viewPhoto(url: string | undefined): void {
    if (!url) return;
    const [bucket, ...rest] = url.split('/');
    const fullUrl = this.fileService.getDownloadUrl(bucket, rest.join('/'));
    window.open(fullUrl, '_blank');
  }
}
