import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { HouseListComponent } from './features/houses/house-list/house-list.component';
import { PersonnelListComponent } from './features/personnel/personnel-list/personnel-list.component';
import { FeedListComponent } from './features/feeds/feed-list/feed-list.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

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
        component: DashboardComponent,
      },
      {
        path: 'houses',
        component: HouseListComponent,
      },
      {
        path: 'personnel',
        component: PersonnelListComponent,
      },
      {
        path: 'feeds',
        component: FeedListComponent,
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
