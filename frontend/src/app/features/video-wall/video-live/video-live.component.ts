import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { VideoPlayerDialogComponent } from '../video-player-dialog/video-player-dialog.component';
import { AiEventMock, VideoStreamMock } from '../models/video.models';
import { CameraService } from '../../../core/services/camera.service';
import { Camera } from '../../../core/models/camera.models';

@Component({
  selector: 'app-video-live',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './video-live.component.html',
  styleUrls: ['./video-live.component.scss'],
})
export class VideoLiveComponent implements OnInit {
  private dialogService = inject(DialogService);
  private cameraService = inject(CameraService);
  private messageService = inject(MessageService);

  searchQuery = signal<string>('');
  cameraFilter = signal<'all' | 'rgb' | 'thermal'>('all');
  selectedStream = signal<VideoStreamMock | null>(null);

  liveStreams = signal<VideoStreamMock[]>([]);

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
    this.loadCameras();
  }

  loadCameras() {
    this.cameraService.getCameras().subscribe({
      next: (cameras: Camera[]) => {
        const mappedStreams: VideoStreamMock[] = cameras.map((cam) => {
          const isActive = cam.isActive;
          const type = cam.type.toLowerCase() as 'rgb' | 'thermal';

          return {
            id: cam.id,
            title: cam.name,
            subTitle: cam.houseName || 'Unassigned',
            statusKey: isActive ? 'VIDEO_WALL.ONLINE' : 'VIDEO_WALL.ERROR',
            fps: isActive ? 25 : 0,
            quality: isActive ? '1080p' : 'Disconnected',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            cameraState: isActive ? 'Normal' : 'Error',
            alertCount: 0,
            audioAlertCount: 0,
            type: type,
            streamUrl: cam.constructedRtspUrl,
          };
        });

        this.liveStreams.set(mappedStreams);

        if (mappedStreams.length > 0 && !this.selectedStream()) {
          this.selectedStream.set(mappedStreams[0]);
        }
      },
      error: (err) => {
        console.error('Failed to load cameras', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load camera list',
        });
      },
    });
  }

  selectStream(stream: VideoStreamMock) {
    this.selectedStream.set(stream);
  }

  setFilter(filter: 'all' | 'rgb' | 'thermal') {
    this.cameraFilter.set(filter);
  }

  playStream(stream: VideoStreamMock) {
    let streamUrl = stream.streamUrl;

    // Браузеры не поддерживают RTSP напрямую.
    // Для демо используем заглушку, если пришла RTSP ссылка.
    // В реальном проекте здесь должен быть URL потока HLS/WebRTC.
    if (!streamUrl || streamUrl.startsWith('rtsp')) {
      console.warn('RTSP stream detected. Using sample video for demo purposes.');
      streamUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    }

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
