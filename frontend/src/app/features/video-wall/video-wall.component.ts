import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { VideoLiveComponent } from './video-live/video-live.component';
import { VideoArchiveListComponent } from './video-archive-list/video-archive-list.component';

@Component({
  selector: 'app-video-wall',
  standalone: true,
  imports: [CommonModule, TranslateModule, VideoLiveComponent, VideoArchiveListComponent],
  templateUrl: './video-wall.component.html',
  styleUrls: ['./video-wall.component.scss'],
})
export class VideoWallComponent {
  activeTab = signal<'live' | 'archive'>('live');
  isDropdownOpen = signal(false);

  setTab(tab: 'live' | 'archive') {
    this.activeTab.set(tab);
    this.isDropdownOpen.set(false);
  }

  toggleDropdown() {
    this.isDropdownOpen.update((v) => !v);
  }
}
