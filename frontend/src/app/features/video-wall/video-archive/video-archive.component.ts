import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { VideoService } from '../../../core/services/video.service';
import { FileMetadata } from '../../../core/models/file.models';
import { VideoPlayerDialogComponent } from '../video-player-dialog/video-player-dialog.component';

@Component({
  selector: 'app-video-archive',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatDialogModule,
    MatChipsModule,
  ],
  templateUrl: './video-archive.component.html',
  styleUrls: ['./video-archive.component.scss'],
})
export class VideoArchiveComponent implements OnInit {
  private videoService = inject(VideoService);
  private dialog = inject(MatDialog);

  buckets = ['user-uploads', 'video-clips', 'raw-video', 'ai-results'];
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

  onTabChange(index: number) {
    // 0 = Live, 1 = Archive
    if (index === 1) {
      this.loadFiles(this.selectedBucket());
    }
  }

  selectBucket(bucket: string) {
    this.selectedBucket.set(bucket);
    this.loadFiles(bucket);
  }

  loadFiles(bucket: string) {
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

    this.dialog.open(VideoPlayerDialogComponent, {
      panelClass: 'no-padding-dialog',
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
