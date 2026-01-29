import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private translate = inject(TranslateService);
  private primeng = inject(PrimeNG);

  currentLang = signal<string>('ru');

  constructor() {
    const savedLang = localStorage.getItem('app_lang') || 'ru';
    this.switchLanguage(savedLang);
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem('app_lang', lang);

    this.translate.get('primeng').subscribe((res: any) => {
      this.primeng.setTranslation(res);
    });
  }
}
