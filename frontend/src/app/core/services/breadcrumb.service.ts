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

  breadcrumbs = signal<Breadcrumb[]>([]);

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const root = this.activatedRoute.root;
      const breadcrumbs = this.createBreadcrumbs(root);
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

      const label = child.snapshot.data['breadcrumb'];

      if (label) {
        breadcrumbs.push({ label, url });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
