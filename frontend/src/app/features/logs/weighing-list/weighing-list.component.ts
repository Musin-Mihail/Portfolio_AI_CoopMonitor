import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
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
  imports: [CommonModule, TableModule, ButtonModule, SelectModule, FormsModule, TooltipModule],
  templateUrl: './weighing-list.component.html',
})
export class WeighingListComponent implements OnInit {
  private service = inject(WeighingService);
  private videoService = inject(VideoService);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  dataSource = signal<WeighingRecord[]>([]);
  logOptions = [
    { label: 'Падёж', value: '/logs/mortality' },
    { label: 'Корм и вода', value: '/logs/feed-water' },
    { label: 'Болезни', value: '/logs/disease' },
    { label: 'Взвешивание', value: '/logs/weighing' },
    { label: 'Маркировка', value: '/logs/marking' },
  ];
  selectedLog = '/logs/weighing';

  ngOnInit() {
    this.loadData();
  }
  onLogChange(event: any) {
    this.router.navigate([event.value]);
  }

  loadData() {
    this.service.getRecords().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error loading records' }),
    });
  }

  openDialog() {
    const ref = this.dialogService.open(WeighingDialogComponent, {
      header: 'Add Weighing Record',
      width: '450px',
      modal: true,
    });
    ref?.onClose.subscribe((result) => {
      if (result) this.service.createRecord(result).subscribe(() => this.loadData());
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
    // URL expected format: bucket/path/to/video.mp4 or just path if handled by backend
    // Assuming format: bucket/filename
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
        mimeType: 'video/mp4', // Default assumption
      },
    });
  }
}
