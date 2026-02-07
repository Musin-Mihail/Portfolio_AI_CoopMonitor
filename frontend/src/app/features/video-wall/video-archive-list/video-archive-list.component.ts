import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { VideoPlayerDialogComponent } from '../video-player-dialog/video-player-dialog.component';
import { VideoStreamMock } from '../models/video.models';

@Component({
  selector: 'app-video-archive-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './video-archive-list.component.html',
  styleUrls: ['./video-archive-list.component.scss'],
})
export class VideoArchiveListComponent {
  private dialogService = inject(DialogService);

  archiveStreams = signal<VideoStreamMock[]>([
    {
      id: 101,
      title: 'House 1 - Zone A',
      date: '14.01.2026',
      statusKey: 'VIDEO_WALL.ONLINE',
      fps: 25,
      quality: '',
      time: '18:29',
      cameraState: 'Normal',
      alertCount: 0,
      eventTag: { labelKey: 'DASHBOARD.EVENTS.MORTALITY_DETECTED', type: 'danger' },
    },
    {
      id: 102,
      title: 'House 1 - Zone A',
      date: '14.01.2026',
      statusKey: 'VIDEO_WALL.ONLINE',
      fps: 25,
      quality: '',
      time: '18:29',
      cameraState: 'Normal',
      alertCount: 0,
      eventTag: { labelKey: 'DASHBOARD.EVENTS.STAFF_ACTIVITY', type: 'info' },
    },
    {
      id: 103,
      title: 'House 1 - Zone A',
      date: '14.01.2026',
      statusKey: 'VIDEO_WALL.ONLINE',
      fps: 25,
      quality: '',
      time: '18:29',
      cameraState: 'Normal',
      alertCount: 0,
      eventTag: { labelKey: 'DASHBOARD.EVENTS.LOW_ACTIVITY', type: 'info' },
    },
  ]);

  playStream(stream: VideoStreamMock) {
    const streamUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    this.dialogService.open(VideoPlayerDialogComponent, {
      header: stream.title,
      width: '80vw',
      contentStyle: { padding: '0', 'background-color': '#000' },
      data: {
        title: stream.title,
        streamUrl: streamUrl,
        mimeType: 'video/mp4',
      },
    });
  }
}
