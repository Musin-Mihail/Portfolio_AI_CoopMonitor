import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core'; // Import
import { AuthService } from '../../core/services/auth.service';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';
import { LanguageService } from '../../core/services/language.service'; // Import

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, TranslateModule], // Add TranslateModule
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  public breadcrumbService = inject(BreadcrumbService);
  public languageService = inject(LanguageService); // Inject

  logout() {
    this.authService.logout();
  }

  toggleLanguage() {
    const newLang = this.languageService.currentLang() === 'ru' ? 'en' : 'ru';
    this.languageService.switchLanguage(newLang);
  }
}
