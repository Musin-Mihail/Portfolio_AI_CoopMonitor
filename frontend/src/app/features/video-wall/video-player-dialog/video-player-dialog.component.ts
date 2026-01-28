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
  templateUrl: './video-player-dialog.component.html',
  styleUrl: './video-player-dialog.component.scss',
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
