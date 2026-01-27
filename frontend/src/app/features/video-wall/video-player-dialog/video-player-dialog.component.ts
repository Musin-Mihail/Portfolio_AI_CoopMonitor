import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface VideoPlayerData {
  title: string;
  streamUrl: string;
  mimeType: string;
}

@Component({
  selector: 'app-video-player-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content class="player-content">
      <video
        #player
        controls
        autoplay
        [src]="data.streamUrl"
        class="video-element">
        Your browser does not support the video tag.
      </video>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        mat-button
        mat-dialog-close>
        Close
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .player-content {
        padding: 0;
        display: flex;
        justify-content: center;
        background-color: black;
      }
      .video-element {
        width: 100%;
        max-height: 70vh;
        outline: none;
      }
      mat-dialog-content {
        max-width: 800px;
        width: 80vw;
      }
    `,
  ],
})
export class VideoPlayerDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<VideoPlayerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VideoPlayerData,
  ) {}
}
