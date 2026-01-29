import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { VideoService } from '../../../core/services/video.service';
import { VideoPlayerDialogComponent } from '../video-player-dialog/video-player-dialog.component';

interface VideoStreamMock {
  id: number;
  title: string;
  statusKey: string;
  fps: number;
  quality: string;
  time: string;
  cameraState: 'Normal' | 'Alert';
  alertCount: number;
  imageUrl?: string;

  date?: string;
  eventTag?: {
    labelKey: string;
    type: 'danger' | 'warning' | 'info' | 'primary';
  };
}

interface AiEventMock {
  time: string;
  titleKey: string;
  location: string;
  type: 'danger' | 'warning' | 'info' | 'primary';
}

@Component({
  selector: 'app-video-archive',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TooltipModule, TranslateModule],
  templateUrl: './video-archive.component.html',
  styleUrls: ['./video-archive.component.scss'],
})
export class VideoArchiveComponent implements OnInit {
  private videoService = inject(VideoService);
  private dialogService = inject(DialogService);

  activeTab = signal<'live' | 'archive'>('live');

  liveStreams = signal<VideoStreamMock[]>([
    {
      id: 1,
      title: 'House 1 - Zone A',
      statusKey: 'VIDEO_WALL.ONLINE',
      fps: 25,
      quality: '1080p',
      time: '18:29',
      cameraState: 'Normal',
      alertCount: 2,
    },
    {
      id: 2,
      title: 'House 1 - Zone A',
      statusKey: 'VIDEO_WALL.ONLINE',
      fps: 25,
      quality: '1080p',
      time: '18:29',
      cameraState: 'Normal',
      alertCount: 2,
    },
    {
      id: 3,
      title: 'House 1 - Zone A',
      statusKey: 'VIDEO_WALL.ONLINE',
      fps: 25,
      quality: '1080p',
      time: '18:29',
      cameraState: 'Normal',
      alertCount: 2,
    },
  ]);

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

  aiEvents = signal<AiEventMock[]>([
    { time: '10:25', titleKey: 'DASHBOARD.EVENTS.ANOMALY', location: 'House 1 - Cam 1', type: 'danger' },
    { time: '08:30', titleKey: 'DASHBOARD.EVENTS.OBJECT_DETECTED', location: 'House 3 - Cam 1', type: 'primary' },
    { time: '10:25', titleKey: 'DASHBOARD.EVENTS.ANOMALY', location: 'House 1 - Cam 1', type: 'danger' },
    { time: '08:30', titleKey: 'DASHBOARD.EVENTS.MOTION', location: 'House 3 - Cam 1', type: 'info' },
  ]);

  ngOnInit(): void {}

  setTab(tab: 'live' | 'archive') {
    this.activeTab.set(tab);
  }

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
