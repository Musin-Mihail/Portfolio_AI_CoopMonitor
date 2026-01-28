import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config'; // <-- FIX: Импортируем PrimeNG вместо PrimeNGConfig

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private translate = inject(TranslateService);
  private primeng = inject(PrimeNG); // <-- FIX: Инжектируем сервис PrimeNG

  currentLang = signal<string>('ru');

  constructor() {
    const savedLang = localStorage.getItem('app_lang') || 'ru';
    this.switchLanguage(savedLang);
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem('app_lang', lang);

    // FIX: Явно указываем тип (res: any), чтобы избежать ошибки TS2571
    this.translate.get('primeng').subscribe((res: any) => {
      this.primeng.setTranslation(res);
    });
  }
}
