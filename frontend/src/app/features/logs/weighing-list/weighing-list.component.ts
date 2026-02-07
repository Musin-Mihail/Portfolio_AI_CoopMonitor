import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WeighingService } from '../../../core/services/weighing.service';
import { VideoService } from '../../../core/services/video.service';
import { WeighingRecord } from '../../../core/models/logs.models';
import { WeighingDialogComponent } from '../weighing-dialog/weighing-dialog.component';
import { VideoPlayerDialogComponent } from '../../video-wall/video-player-dialog/video-player-dialog.component';
import { LogFilterService } from '../services/log-filter.service';

@Component({
  selector: 'app-weighing-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule, TranslateModule],
  templateUrl: './weighing-list.component.html',
})
export class WeighingListComponent implements OnInit {
  private service = inject(WeighingService);
  private filterService = inject(LogFilterService);
  private videoService = inject(VideoService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);

  dataSource = signal<WeighingRecord[]>([]);

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

  openDialog(record?: WeighingRecord) {
    const ref = this.dialogService.open(WeighingDialogComponent, {
      showHeader: false,
      width: 'golden-lg',
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

  viewVideo(url: string | undefined): void {
    if (!url) return;
    const [bucket, ...rest] = url.split('/');
    const fileName = rest.join('/');

    const streamUrl = this.videoService.getStreamUrl(bucket, fileName);

    this.dialogService.open(VideoPlayerDialogComponent, {
      header: this.translate.instant('LOGS_WEIGHING.VIDEO_EVIDENCE'),
      width: '70vw',
      contentStyle: { padding: '0', 'background-color': '#000' },
      data: {
        title: 'Evidence',
        streamUrl: streamUrl,
        mimeType: 'video/mp4',
      },
    });
  }
}
