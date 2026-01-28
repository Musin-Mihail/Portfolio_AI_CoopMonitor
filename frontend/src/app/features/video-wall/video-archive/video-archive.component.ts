import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { VideoService } from '../../../core/services/video.service';
import { VideoPlayerDialogComponent } from '../video-player-dialog/video-player-dialog.component';

interface VideoStreamMock {
  id: number;
  title: string;
  status: 'Online' | 'Offline';
  fps: number;
  quality: string;
  time: string;
  cameraState: 'Normal' | 'Alert';
  alertCount: number;
  imageUrl?: string;

  // Archive specific properties
  date?: string;
  eventTag?: {
    label: string;
    type: 'danger' | 'warning' | 'info' | 'primary';
  };
}

interface AiEventMock {
  time: string;
  title: string;
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

  // State
  activeTab = signal<'live' | 'archive'>('live');

  // Mocks based on "Трансляция"
  liveStreams = signal<VideoStreamMock[]>([
    {
      id: 1,
      title: 'Птичник 1 - Зона А',
      status: 'Online',
      fps: 25,
      quality: '1080p',
      time: '18:29',
      cameraState: 'Normal',
      alertCount: 2,
    },
    {
      id: 2,
      title: 'Птичник 1 - Зона А',
      status: 'Online',
      fps: 25,
      quality: '1080p',
      time: '18:29',
      cameraState: 'Normal',
      alertCount: 2,
    },
    {
      id: 3,
      title: 'Птичник 1 - Зона А',
      status: 'Online',
      fps: 25,
      quality: '1080p',
      time: '18:29',
      cameraState: 'Normal',
      alertCount: 2,
    },
  ]);

  // Mocks based on "Архив"
  archiveStreams = signal<VideoStreamMock[]>([
    {
      id: 101,
      title: 'Птичник 1 - Зона А',
      date: '14.01.2026',
      status: 'Online',
      fps: 25,
      quality: '',
      time: '18:29',
      cameraState: 'Normal',
      alertCount: 0,
      eventTag: { label: 'Падеж обнаружен', type: 'danger' },
    },
    {
      id: 102,
      title: 'Птичник 1 - Зона А',
      date: '14.01.2026',
      status: 'Online',
      fps: 25,
      quality: '',
      time: '18:29',
      cameraState: 'Normal',
      alertCount: 0,
      eventTag: { label: 'Вход персонала', type: 'info' },
    },
    {
      id: 103,
      title: 'Птичник 1 - Зона А',
      date: '14.01.2026',
      status: 'Online',
      fps: 25,
      quality: '',
      time: '18:29',
      cameraState: 'Normal',
      alertCount: 0,
      eventTag: { label: 'Низкая активность', type: 'info' },
    },
  ]);

  // Sidebar Events Mock
  aiEvents = signal<AiEventMock[]>([
    { time: '10:25', title: 'Аномальная активность', location: 'Птичник 1 - Камера 1', type: 'danger' },
    { time: '08:30', title: 'Обнаружен объект', location: 'Птичник 3 - Камера 1', type: 'primary' },
    { time: '10:25', title: 'Аномальная активность', location: 'Птичник 1 - Камера 1', type: 'danger' },
    { time: '08:30', title: 'Движение', location: 'Птичник 3 - Камера 1', type: 'info' },
  ]);

  ngOnInit(): void {
    // Initial data load if needed
  }

  setTab(tab: 'live' | 'archive') {
    this.activeTab.set(tab);
  }

  playStream(stream: VideoStreamMock) {
    // Mock play functionality
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
