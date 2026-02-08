import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ReportsListComponent } from './features/reports/reports-list/reports-list.component';
import { AdminLayoutComponent } from './features/layout/admin-layout/admin-layout.component';
import { LogsLayoutComponent } from './features/layout/logs-layout/logs-layout.component';
import { MasterDataLayoutComponent } from './features/layout/master-data-layout/master-data-layout.component';
import { HouseListComponent } from './features/houses/house-list/house-list.component';
import { PersonnelListComponent } from './features/personnel/personnel-list/personnel-list.component';
import { FeedListComponent } from './features/feeds/feed-list/feed-list.component';
import { MortalityListComponent } from './features/logs/mortality-list/mortality-list.component';
import { FeedWaterListComponent } from './features/logs/feed-water-list/feed-water-list.component';
import { DiseaseListComponent } from './features/logs/disease-list/disease-list.component';
import { WeighingListComponent } from './features/logs/weighing-list/weighing-list.component';
import { MarkingListComponent } from './features/logs/marking-list/marking-list.component';
import { BatchInfoListComponent } from './features/logs/batch-info-list/batch-info-list.component';
import { UserListComponent } from './features/admin/user-list/user-list.component';
import { AuditListComponent } from './features/admin/audit-list/audit-list.component';
import { SystemStatusComponent } from './features/settings/system-status/system-status.component';
import { FlocksComponent } from './features/flocks/flocks.component';
import { VideoWallComponent } from './features/video-wall/video-wall.component';
import { CameraListComponent } from './features/cameras/camera-list/camera-list.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'MENU.HOME' },
    children: [
      {
        path: '',
        component: DashboardComponent,
        data: { breadcrumb: 'MENU.DASHBOARD' },
      },
      {
        path: 'flocks',
        component: FlocksComponent,
        data: { breadcrumb: 'MENU.FLOCKS' },
      },
      {
        path: 'video-wall',
        component: VideoWallComponent,
        data: { breadcrumb: 'MENU.VIDEO_WALL' },
      },
      {
        path: 'reports',
        component: ReportsListComponent,
        data: { breadcrumb: 'MENU.REPORTS' },
      },
      {
        path: 'logs',
        component: LogsLayoutComponent,
        data: { breadcrumb: 'MENU.LOGS' },
        children: [
          { path: '', redirectTo: 'batch-info', pathMatch: 'full' },
          { path: 'batch-info', component: BatchInfoListComponent, data: { breadcrumb: 'MENU.LOGS_BATCH_INFO' } },
          { path: 'mortality', component: MortalityListComponent, data: { breadcrumb: 'MENU.LOGS_MORTALITY' } },
          { path: 'feed-water', component: FeedWaterListComponent, data: { breadcrumb: 'MENU.LOGS_FEED_WATER' } },
          { path: 'disease', component: DiseaseListComponent, data: { breadcrumb: 'MENU.LOGS_DISEASE' } },
          { path: 'weighing', component: WeighingListComponent, data: { breadcrumb: 'MENU.LOGS_WEIGHING' } },
          { path: 'marking', component: MarkingListComponent, data: { breadcrumb: 'MENU.LOGS_MARKING' } },
        ],
      },
      {
        path: 'master-data',
        component: MasterDataLayoutComponent,
        data: { breadcrumb: 'MENU.MASTER_DATA' },
        children: [
          { path: '', redirectTo: 'houses', pathMatch: 'full' },
          { path: 'houses', component: HouseListComponent, data: { breadcrumb: 'MENU.MD_HOUSES' } },
          { path: 'personnel', component: PersonnelListComponent, data: { breadcrumb: 'MENU.MD_PERSONNEL' } },
          { path: 'feeds', component: FeedListComponent, data: { breadcrumb: 'MENU.MD_FEEDS' } },
          { path: 'cameras', component: CameraListComponent, data: { breadcrumb: 'MENU.MD_CAMERAS' } },
        ],
      },
      {
        path: 'admin',
        component: AdminLayoutComponent,
        data: { breadcrumb: 'MENU.ADMIN' },
        children: [
          { path: '', redirectTo: 'audit', pathMatch: 'full' },
          { path: 'users', component: UserListComponent, data: { breadcrumb: 'MENU.ADMIN_USERS' } },
          { path: 'audit', component: AuditListComponent, data: { breadcrumb: 'MENU.ADMIN_AUDIT' } },
          { path: 'settings', component: SystemStatusComponent, data: { breadcrumb: 'MENU.ADMIN_STATUS' } },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
