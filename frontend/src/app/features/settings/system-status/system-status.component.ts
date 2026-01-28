import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { SettingsService } from '../../../core/services/settings.service';
import { SystemStatus } from '../../../core/models/settings.models';

@Component({
  selector: 'app-system-status',
  standalone: true,
  imports: [CommonModule, CardModule, ProgressBarModule, ButtonModule, TagModule, DividerModule, TooltipModule],
  templateUrl: './system-status.component.html',
  styleUrls: ['./system-status.component.scss'],
})
export class SystemStatusComponent implements OnInit {
  private service = inject(SettingsService);
  private messageService = inject(MessageService);

  status = signal<SystemStatus | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus(): void {
    this.isLoading.set(true);
    this.service.getSystemStatus().subscribe({
      next: (data) => {
        this.status.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.showError('Failed to load system status');
        this.isLoading.set(false);
      },
    });
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  }

  private showError(msg: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 3000 });
  }
}
