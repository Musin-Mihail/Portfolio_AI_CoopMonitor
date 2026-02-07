import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { VideoPlayerDialogComponent } from '../video-player-dialog/video-player-dialog.component';
import { AiEventMock, VideoStreamMock } from '../models/video.models';

@Component({
  selector: 'app-video-live',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './video-live.component.html',
  styleUrls: ['./video-live.component.scss'],
})
export class VideoLiveComponent implements OnInit {
  private dialogService = inject(DialogService);

  searchQuery = signal<string>('');
  cameraFilter = signal<'all' | 'rgb' | 'thermal'>('all');
  selectedStream = signal<VideoStreamMock | null>(null);

  liveStreams = signal<VideoStreamMock[]>([
    {
      id: 1,
      title: 'Stado A-001',
      subTitle: 'House 1',
      statusKey: 'VIDEO_WALL.ONLINE',
      fps: 25,
      quality: '1080p',
      time: '18:29',
      cameraState: 'Alert',
      alertCount: 1,
      audioAlertCount: 1,
      type: 'rgb',
    },
    {
      id: 2,
      title: 'Stado A-001',
      subTitle: 'House 1',
      statusKey: 'VIDEO_WALL.ONLINE',
      fps: 25,
      quality: '1080p',
      time: '18:29',
      cameraState: 'Normal',
      alertCount: 0,
      audioAlertCount: 0,
      type: 'rgb',
    },
    {
      id: 3,
      title: 'Stado A-001',
      subTitle: 'House 1',
      statusKey: 'VIDEO_WALL.ERROR',
      fps: 0,
      quality: 'Disconnected',
      time: '18:29',
      cameraState: 'Error',
      alertCount: 0,
      audioAlertCount: 0,
      type: 'thermal',
    },
    {
      id: 4,
      title: 'Stado A-001',
      subTitle: 'House 1',
      statusKey: 'VIDEO_WALL.ONLINE',
      fps: 25,
      quality: '1080p',
      time: '18:29',
      cameraState: 'Alert',
      alertCount: 1,
      audioAlertCount: 1,
      type: 'rgb',
    },
  ]);

  aiEvents = signal<AiEventMock[]>([
    { time: '10:25', titleKey: 'DASHBOARD.EVENTS.ANOMALY', location: 'House 1 - Cam 1', type: 'danger' },
    { time: '08:30', titleKey: 'DASHBOARD.EVENTS.OBJECT_DETECTED', location: 'House 3 - Cam 1', type: 'primary' },
    { time: '10:25', titleKey: 'DASHBOARD.EVENTS.ANOMALY', location: 'House 1 - Cam 1', type: 'danger' },
    { time: '08:30', titleKey: 'DASHBOARD.EVENTS.MOTION', location: 'House 3 - Cam 1', type: 'info' },
    { time: '08:30', titleKey: 'DASHBOARD.EVENTS.OBJECT_DETECTED', location: 'House 3 - Cam 1', type: 'primary' },
    { time: '08:30', titleKey: 'DASHBOARD.EVENTS.MOTION', location: 'House 3 - Cam 1', type: 'info' },
  ]);

  filteredLiveStreams = computed(() => {
    let streams = this.liveStreams();
    const query = this.searchQuery().toLowerCase();
    const filter = this.cameraFilter();

    if (filter !== 'all') {
      streams = streams.filter((s) => s.type === filter);
    }

    if (query) {
      streams = streams.filter(
        (s) => s.title.toLowerCase().includes(query) || s.subTitle?.toLowerCase().includes(query),
      );
    }

    return streams;
  });

  ngOnInit(): void {
    if (this.liveStreams().length > 0) {
      this.selectedStream.set(this.liveStreams()[0]);
    }
  }

  selectStream(stream: VideoStreamMock) {
    this.selectedStream.set(stream);
  }

  setFilter(filter: 'all' | 'rgb' | 'thermal') {
    this.cameraFilter.set(filter);
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
