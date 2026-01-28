import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ReportsListComponent } from './features/reports/reports-list/reports-list.component';
import { VideoArchiveComponent } from './features/video-wall/video-archive/video-archive.component';

// Layouts
import { AdminLayoutComponent } from './features/layout/admin-layout/admin-layout.component';
import { LogsLayoutComponent } from './features/layout/logs-layout/logs-layout.component';
import { MasterDataLayoutComponent } from './features/layout/master-data-layout/master-data-layout.component';

// Features
import { HouseListComponent } from './features/houses/house-list/house-list.component';
import { PersonnelListComponent } from './features/personnel/personnel-list/personnel-list.component';
import { FeedListComponent } from './features/feeds/feed-list/feed-list.component';
import { MortalityListComponent } from './features/logs/mortality-list/mortality-list.component';
import { FeedWaterListComponent } from './features/logs/feed-water-list/feed-water-list.component';
import { DiseaseListComponent } from './features/logs/disease-list/disease-list.component';
import { WeighingListComponent } from './features/logs/weighing-list/weighing-list.component';
import { MarkingListComponent } from './features/logs/marking-list/marking-list.component';
import { UserListComponent } from './features/admin/user-list/user-list.component';
import { AuditListComponent } from './features/admin/audit-list/audit-list.component';
import { SystemStatusComponent } from './features/settings/system-status/system-status.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    // На логине хлебные крошки обычно не нужны, но можно добавить data: { breadcrumb: 'Вход' }
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    // Корневой лейбл, который будет скрыт или показан как "Главная"
    data: { breadcrumb: 'Главная' },
    children: [
      {
        path: '',
        component: DashboardComponent,
        data: { breadcrumb: 'Дашборд' },
      },
      {
        path: 'video-wall',
        component: VideoArchiveComponent,
        data: { breadcrumb: 'Видеостена' },
      },
      {
        path: 'reports',
        component: ReportsListComponent,
        data: { breadcrumb: 'Отчеты' },
      },
      // Группа Журналы (Logs)
      {
        path: 'logs',
        component: LogsLayoutComponent,
        data: { breadcrumb: 'Журналы' },
        children: [
          { path: '', redirectTo: 'mortality', pathMatch: 'full' },
          { path: 'mortality', component: MortalityListComponent, data: { breadcrumb: 'Падеж' } },
          { path: 'feed-water', component: FeedWaterListComponent, data: { breadcrumb: 'Корм и вода' } },
          { path: 'disease', component: DiseaseListComponent, data: { breadcrumb: 'Болезни' } },
          { path: 'weighing', component: WeighingListComponent, data: { breadcrumb: 'Взвешивание' } },
          { path: 'marking', component: MarkingListComponent, data: { breadcrumb: 'Маркировка' } },
        ],
      },
      // Группа Справочники (Master Data)
      {
        path: 'master-data',
        component: MasterDataLayoutComponent,
        data: { breadcrumb: 'Справочники' },
        children: [
          { path: '', redirectTo: 'houses', pathMatch: 'full' },
          { path: 'houses', component: HouseListComponent, data: { breadcrumb: 'Птичники' } },
          { path: 'personnel', component: PersonnelListComponent, data: { breadcrumb: 'Персонал' } },
          { path: 'feeds', component: FeedListComponent, data: { breadcrumb: 'Корма' } },
        ],
      },
      // Группа Администрирование (Admin)
      {
        path: 'admin',
        component: AdminLayoutComponent,
        data: { breadcrumb: 'Администрирование' },
        children: [
          { path: '', redirectTo: 'audit', pathMatch: 'full' },
          { path: 'users', component: UserListComponent, data: { breadcrumb: 'Пользователи' } },
          { path: 'audit', component: AuditListComponent, data: { breadcrumb: 'Аудит' } },
          { path: 'settings', component: SystemStatusComponent, data: { breadcrumb: 'Статус системы' } },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
