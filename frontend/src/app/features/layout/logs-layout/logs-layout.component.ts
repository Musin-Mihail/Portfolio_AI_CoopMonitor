import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { filter } from 'rxjs';

@Component({
  selector: 'app-logs-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SelectModule, FormsModule],
  templateUrl: './logs-layout.component.html',
})
export class LogsLayoutComponent implements OnInit {
  private router = inject(Router);

  selectedLog = signal<string>('');

  logOptions = [
    { label: 'Падёж', value: '/logs/mortality' },
    { label: 'Корм и вода', value: '/logs/feed-water' },
    { label: 'Болезни', value: '/logs/disease' },
    { label: 'Взвешивание', value: '/logs/weighing' },
    { label: 'Маркировка', value: '/logs/marking' },
  ];

  ngOnInit() {
    this.updateSelection();

    // Слушаем изменения роута, чтобы обновлять селектор если пользователь нажал "Назад"
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateSelection();
    });
  }

  private updateSelection() {
    const currentUrl = this.router.url;
    // Находим опцию, которая соответствует текущему URL
    const activeOption = this.logOptions.find((opt) => currentUrl.includes(opt.value));
    if (activeOption) {
      this.selectedLog.set(activeOption.value);
    }
  }

  onLogChange(event: any) {
    this.router.navigate([event.value]);
  }
}
