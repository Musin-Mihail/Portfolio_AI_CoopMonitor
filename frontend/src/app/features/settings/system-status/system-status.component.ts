import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../../core/services/settings.service';
import { SystemStatus } from '../../../core/models/settings.models';

@Component({
  selector: 'app-system-status',
  standalone: true,
  imports: [
    CommonModule,
    ProgressBarModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './system-status.component.html',
  styleUrl: './system-status.component.scss',
})
export class SystemStatusComponent implements OnInit {
  private service = inject(SettingsService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  status = signal<SystemStatus | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus(): void {
    this.isLoading.set(true);
    // Имитация задержки для демонстрации спиннера (можно убрать в проде)
    setTimeout(() => {
      this.service.getSystemStatus().subscribe({
        next: (data) => {
          this.status.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.showError(this.translate.instant('COMMON.LOAD_ERROR'));
          this.isLoading.set(false);
        },
      });
    }, 500);
  }

  formatBytes(bytes: number): string {
    const unit = this.translate.instant('COMMON.MB');
    if (bytes === 0) return `0 ${unit}`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} ${unit}`;
  }

  private showError(msg: string): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('COMMON.ERROR'),
      detail: msg,
      life: 3000,
    });
  }
}
