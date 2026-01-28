import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { TranslateModule } from '@ngx-translate/core'; // Import
import { filter } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TabsModule, TranslateModule], // Add Module
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent implements OnInit {
  private router = inject(Router);
  activeTab = signal<string>('audit');

  ngOnInit() {
    this.updateTab();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => this.updateTab());
  }

  updateTab() {
    const url = this.router.url;
    if (url.includes('/admin/audit')) this.activeTab.set('audit');
    else if (url.includes('/admin/users')) this.activeTab.set('users');
    else if (url.includes('/admin/settings')) this.activeTab.set('settings');
  }

  onTabChange(value: string) {
    if (value === 'audit') this.router.navigate(['/admin/audit']);
    if (value === 'users') this.router.navigate(['/admin/users']);
    if (value === 'settings') this.router.navigate(['/admin/settings']);
  }
}
