import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { WeighingService } from '../../../core/services/weighing.service';
import { VideoService } from '../../../core/services/video.service';
import { WeighingRecord } from '../../../core/models/logs.models';
import { WeighingDialogComponent } from '../weighing-dialog/weighing-dialog.component';
import { VideoPlayerDialogComponent } from '../../video-wall/video-player-dialog/video-player-dialog.component';

@Component({
  selector: 'app-weighing-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule],
  templateUrl: './weighing-list.component.html',
})
export class WeighingListComponent implements OnInit {
  private service = inject(WeighingService);
  private videoService = inject(VideoService);
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
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error loading records' }),
    });
  }

  openDialog(record?: WeighingRecord) {
    const ref = this.dialogService.open(WeighingDialogComponent, {
      header: record ? 'Edit Weighing Record' : 'Add Weighing Record',
      width: '450px',
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

  viewVideo(url: string | undefined): void {
    if (!url) return;
    const [bucket, ...rest] = url.split('/');
    const fileName = rest.join('/');

    const streamUrl = this.videoService.getStreamUrl(bucket, fileName);

    this.dialogService.open(VideoPlayerDialogComponent, {
      header: 'Weighing Evidence',
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
