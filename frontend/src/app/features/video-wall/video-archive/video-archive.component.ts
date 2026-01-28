import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogService } from 'primeng/dynamicdialog';
import { TagModule } from 'primeng/tag';

import { VideoService } from '../../../core/services/video.service';
import { FileMetadata } from '../../../core/models/file.models';
import { VideoPlayerDialogComponent } from '../video-player-dialog/video-player-dialog.component';

@Component({
  selector: 'app-video-archive',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    CardModule,
    ButtonModule,
    ListboxModule,
    ProgressBarModule,
    TagModule,
  ],
  templateUrl: './video-archive.component.html',
  styleUrls: ['./video-archive.component.scss'],
})
export class VideoArchiveComponent implements OnInit {
  private videoService = inject(VideoService);
  private dialogService = inject(DialogService);

  // Data for Bucket Selector (Listbox)
  buckets = [
    { label: 'User Uploads', value: 'user-uploads' },
    { label: 'Video Clips', value: 'video-clips' },
    { label: 'Raw Video', value: 'raw-video' },
    { label: 'AI Results', value: 'ai-results' },
  ];

  selectedBucket = signal<string>('user-uploads');
  files = signal<FileMetadata[]>([]);
  isLoading = signal<boolean>(false);

  // Mock Live Streams
  liveStreams = [
    { id: 1, name: 'House 1 - Main Cam', status: 'Online' },
    { id: 2, name: 'House 1 - Thermal', status: 'Online' },
    { id: 3, name: 'House 2 - Main Cam', status: 'Offline' },
  ];

  ngOnInit(): void {
    this.loadFiles(this.selectedBucket());
  }

  // PrimeNG Listbox emits standard change event with value
  onBucketChange(event: any) {
    // event.value is the selected value
    this.loadFiles(event.value);
  }

  loadFiles(bucket: string) {
    if (!bucket) return;
    this.isLoading.set(true);
    this.videoService.listFiles(bucket).subscribe({
      next: (data) => {
        this.files.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.files.set([]);
      },
    });
  }

  playVideo(file: FileMetadata) {
    const streamUrl = this.videoService.getStreamUrl(file.bucket, file.name);

    this.dialogService.open(VideoPlayerDialogComponent, {
      header: file.name,
      width: '70vw',
      contentStyle: { padding: '0', 'background-color': '#000' },
      data: {
        title: file.name,
        streamUrl: streamUrl,
        mimeType: file.contentType,
      },
    });
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isPlayable(file: FileMetadata): boolean {
    return file.contentType.startsWith('video/') || file.name.endsWith('.mp4');
  }
}
