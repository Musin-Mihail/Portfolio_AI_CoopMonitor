import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { HouseListComponent } from './features/houses/house-list/house-list.component';
import { PersonnelListComponent } from './features/personnel/personnel-list/personnel-list.component';
import { FeedListComponent } from './features/feeds/feed-list/feed-list.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MortalityListComponent } from './features/logs/mortality-list/mortality-list.component';
import { FeedWaterListComponent } from './features/logs/feed-water-list/feed-water-list.component';
import { DiseaseListComponent } from './features/logs/disease-list/disease-list.component';
import { WeighingListComponent } from './features/logs/weighing-list/weighing-list.component';
import { MarkingListComponent } from './features/logs/marking-list/marking-list.component';
import { ReportsListComponent } from './features/reports/reports-list/reports-list.component';
import { UserListComponent } from './features/admin/user-list/user-list.component';
import { VideoArchiveComponent } from './features/video-wall/video-archive/video-archive.component';
import { AuditListComponent } from './features/admin/audit-list/audit-list.component';
import { SystemStatusComponent } from './features/settings/system-status/system-status.component';

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
        path: 'video-wall',
        component: VideoArchiveComponent,
      },
      {
        path: 'reports',
        component: ReportsListComponent,
      },
      // Группа Журналы
      {
        path: 'logs',
        redirectTo: 'logs/mortality',
        pathMatch: 'full',
      },
      { path: 'logs/mortality', component: MortalityListComponent },
      { path: 'logs/feed-water', component: FeedWaterListComponent },
      { path: 'logs/disease', component: DiseaseListComponent },
      { path: 'logs/weighing', component: WeighingListComponent },
      { path: 'logs/marking', component: MarkingListComponent },
      // Группа Справочники (Master Data)
      {
        path: 'master-data',
        redirectTo: 'master-data/houses',
        pathMatch: 'full',
      },
      { path: 'master-data/houses', component: HouseListComponent },
      { path: 'master-data/personnel', component: PersonnelListComponent },
      { path: 'master-data/feeds', component: FeedListComponent },
      // Группа Администрирование
      {
        path: 'admin',
        redirectTo: 'admin/audit',
        pathMatch: 'full',
      },
      { path: 'admin/users', component: UserListComponent },
      { path: 'admin/audit', component: AuditListComponent },
      { path: 'admin/settings', component: SystemStatusComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
