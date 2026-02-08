import { Component, computed, inject, OnInit, signal, ViewChild, ElementRef, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { AiEventMock, VideoStreamMock } from '../models/video.models';
import { CameraService } from '../../../core/services/camera.service';
import { Camera } from '../../../core/models/camera.models';
import Hls from 'hls.js';

@Component({
  selector: 'app-video-live',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './video-live.component.html',
  styleUrls: ['./video-live.component.scss'],
})
export class VideoLiveComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private cameraService = inject(CameraService);
  private messageService = inject(MessageService);

  @ViewChild('mainPlayer') mainPlayerRef!: ElementRef<HTMLVideoElement>;
  private hls: Hls | null = null;

  searchQuery = signal<string>('');
  cameraFilter = signal<'all' | 'rgb' | 'thermal'>('all');
  selectedStream = signal<VideoStreamMock | null>(null);

  liveStreams = signal<VideoStreamMock[]>([]);
  aiEvents = signal<AiEventMock[]>([
    { time: '10:25', titleKey: 'DASHBOARD.EVENTS.ANOMALY', location: 'House 1 - Cam 1', type: 'danger' },
    { time: '08:30', titleKey: 'DASHBOARD.EVENTS.OBJECT_DETECTED', location: 'House 3 - Cam 1', type: 'primary' },
    { time: '10:25', titleKey: 'DASHBOARD.EVENTS.ANOMALY', location: 'House 1 - Cam 1', type: 'danger' },
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

  constructor() {
    effect(() => {
      const stream = this.selectedStream();
      if (stream) {
        setTimeout(() => this.playStreamInMainPlayer(stream), 50);
      }
    });
  }

  ngOnInit(): void {
    this.loadCameras();
  }

  ngOnDestroy(): void {
    if (this.hls) {
      this.hls.destroy();
    }
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

  playStreamInMainPlayer(stream: VideoStreamMock) {
    if (!this.mainPlayerRef) return;
    const video = this.mainPlayerRef.nativeElement;

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    const streamName = `cam${stream.id}`;
    const hlsUrl = `http://localhost:8888/${streamName}/index.m3u8`;

    console.log(`Playing HLS stream: ${hlsUrl}`);

    if (Hls.isSupported()) {
      this.hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      });

      this.hls.loadSource(hlsUrl);
      this.hls.attachMedia(video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => console.warn('Auto-play blocked:', e));
      });

      this.hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS Fatal Error:', data.type);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              this.hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              this.hls?.recoverMediaError();
              break;
            default:
              this.hls?.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
    }
  }
}
