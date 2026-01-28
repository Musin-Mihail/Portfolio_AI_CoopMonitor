import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';

export interface VideoPlayerData {
  title: string;
  streamUrl: string;
  mimeType: string;
}

@Component({
  selector: 'app-video-player-dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="w-full h-full flex flex-col bg-black">
      <div class="flex-grow flex items-center justify-center overflow-hidden">
        <video
          #player
          controls
          autoplay
          [src]="data.streamUrl"
          class="max-w-full max-h-[70vh] w-auto h-auto outline-none">
          Your browser does not support the video tag.
        </video>
      </div>
      <div class="flex justify-end p-2 bg-black border-t border-slate-800">
        <p-button
          label="Close"
          icon="pi pi-times"
          [text]="true"
          severity="secondary"
          styleClass="text-white hover:text-slate-300"
          (onClick)="close()" />
      </div>
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
export class VideoPlayerDialogComponent {
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  get data(): VideoPlayerData {
    return this.config.data;
  }

  close() {
    this.ref.close();
  }
}
