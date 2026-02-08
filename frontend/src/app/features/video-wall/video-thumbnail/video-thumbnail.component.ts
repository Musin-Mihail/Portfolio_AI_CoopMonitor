import { Component, ElementRef, OnDestroy, OnInit, ViewChild, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';

@Component({
  selector: 'app-video-thumbnail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
      <div
        *ngIf="isLoading"
        class="absolute inset-0 flex items-center justify-center z-10 bg-slate-800">
        <i class="pi pi-spin pi-spinner text-slate-500 text-2xl"></i>
      </div>

      <video
        #video
        muted
        autoplay
        playsinline
        class="w-full h-full object-cover"></video>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class VideoThumbnailComponent implements OnInit, OnDestroy {
  streamUrl = input.required<string | undefined>();
  streamId = input.required<number>();

  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  private hls: Hls | null = null;
  isLoading = true;

  constructor() {
    effect(() => {
      const url = this.streamUrl();
      const id = this.streamId();
      setTimeout(() => this.setupHls(url, id), 100);
    });
  }

  ngOnInit() {}

  setupHls(rtspUrl: string | undefined, id: number) {
    this.destroyHls();
    this.isLoading = true;

    if (!this.videoRef) return;
    const video = this.videoRef.nativeElement;
    video.muted = true;

    let streamName = `cam${id}`;

    if (rtspUrl && rtspUrl.includes('/')) {
      streamName = `cam${id}`;
    }

    const hlsUrl = `http://localhost:8888/${streamName}/index.m3u8`;

    if (Hls.isSupported()) {
      this.hls = new Hls({
        enableWorker: true,
        capLevelToPlayerSize: true,
        maxBufferLength: 2,
        backBufferLength: 0,
      });

      this.hls.loadSource(hlsUrl);
      this.hls.attachMedia(video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        this.isLoading = false;
      });

      this.hls.on(Hls.Events.ERROR, (e, data) => {
        if (data.fatal) {
          this.isLoading = false;
          this.destroyHls();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play();
        this.isLoading = false;
      });
    }
  }

  destroyHls() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }

  ngOnDestroy() {
    this.destroyHls();
  }
}
