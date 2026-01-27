import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  private authService = inject(AuthService);

  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/' },
    { label: 'Houses', icon: 'home_work', route: '/houses' },
    { label: 'Personnel', icon: 'people', route: '/personnel' },
    { label: 'Feeds', icon: 'grass', route: '/feeds' },
    { label: 'Reports', icon: 'assessment', route: '/reports' },
  ];

  logout() {
    this.authService.logout();
  }
}
