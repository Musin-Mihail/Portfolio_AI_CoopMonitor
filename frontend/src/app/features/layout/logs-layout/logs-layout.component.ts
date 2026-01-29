import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { LogsFilterComponent } from '../../logs/components/logs-filter/logs-filter.component';

@Component({
  selector: 'app-logs-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SelectModule, FormsModule, TranslateModule, LogsFilterComponent],
  templateUrl: './logs-layout.component.html',
})
export class LogsLayoutComponent implements OnInit {
  private router = inject(Router);

  selectedLog = signal<string>('');

  logOptions = [
    { label: 'MENU.LOGS_BATCH_INFO', value: '/logs/batch-info' },
    { label: 'MENU.LOGS_MORTALITY', value: '/logs/mortality' },
    { label: 'MENU.LOGS_FEED_WATER', value: '/logs/feed-water' },
    { label: 'MENU.LOGS_DISEASE', value: '/logs/disease' },
    { label: 'MENU.LOGS_WEIGHING', value: '/logs/weighing' },
    { label: 'MENU.LOGS_MARKING', value: '/logs/marking' },
  ];

  ngOnInit() {
    this.updateSelection();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateSelection();
    });
  }

  private updateSelection() {
    const currentUrl = this.router.url;
    const activeOption = this.logOptions.find((opt) => currentUrl.includes(opt.value));
    if (activeOption) {
      this.selectedLog.set(activeOption.value);
    }
  }

  onLogChange(event: any) {
    this.router.navigate([event.value]);
  }
}
