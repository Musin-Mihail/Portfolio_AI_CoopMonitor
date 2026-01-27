import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./app').then((m) => m.App), // Временная заглушка, позже заменим на Dashboard
      },
      // Здесь будут добавляться дочерние маршруты (houses, personnel, etc.)
    ],
  },
  { path: '**', redirectTo: '' },
];
