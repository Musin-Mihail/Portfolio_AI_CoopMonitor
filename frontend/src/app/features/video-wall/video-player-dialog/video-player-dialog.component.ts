import { Component, ElementRef, inject, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import Hls from 'hls.js';

export interface VideoPlayerData {
  title: string;
  streamUrl: string;
  mimeType: string;
}

@Component({
  selector: 'app-video-player-dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule, TranslateModule],
  templateUrl: './video-player-dialog.component.html',
  styleUrl: './video-player-dialog.component.scss',
})
export class VideoPlayerDialogComponent implements AfterViewInit, OnDestroy {
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  @ViewChild('player') videoElementRef!: ElementRef<HTMLVideoElement>;
  private hls: Hls | null = null;

  get data(): VideoPlayerData {
    return this.config.data;
  }

  ngAfterViewInit() {
    this.initPlayer();
  }

  initPlayer() {
    const video = this.videoElementRef.nativeElement;
    const url = this.data.streamUrl;

    if (Hls.isSupported()) {
      this.hls = new Hls({
        debug: false,
        enableWorker: true,
      });
      
      this.hls.loadSource(url);
      this.hls.attachMedia(video);
      
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => console.error('Auto-play failed', e));
      });

      this.hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS Fatal Error', data);
        }
      });
    } 
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
    }
  }

  close() {
    this.ref.close();
  }

  ngOnDestroy() {
    if (this.hls) {
      this.hls.destroy();
    }
  }
}