import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, Data } from '@angular/router';
import { filter } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  // Используем сигнал для реактивного обновления в шаблоне
  breadcrumbs = signal<Breadcrumb[]>([]);

  constructor() {
    // Слушаем окончание навигации
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const root = this.activatedRoute.root;
      const breadcrumbs = this.createBreadcrumbs(root);
      // Всегда добавляем "Home" или "Dashboard" первым элементом, если нужно
      // Но в вашей структуре Dashboard это '', так что логика ниже отработает корректно
      this.breadcrumbs.set(breadcrumbs);
    });
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map((segment) => segment.path).join('/');

      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      // Проверяем наличие label в data роута
      const label = child.snapshot.data['breadcrumb'];

      // Если label есть, добавляем в крошки.
      // Проверка на breadcrumbs.length > 0 нужна, чтобы не дублировать пути, если вложенность сложная
      if (label) {
        breadcrumbs.push({ label, url });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
