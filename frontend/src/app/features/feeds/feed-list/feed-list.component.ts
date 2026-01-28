import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Feed } from '../../../core/models/master-data.models';
import { FeedsService } from '../../../core/services/feeds.service';
import { FeedDialogComponent } from '../feed-dialog/feed-dialog.component';

@Component({
  selector: 'app-feed-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TranslateModule, TooltipModule],
  templateUrl: './feed-list.component.html',
})
export class FeedListComponent implements OnInit {
  private service = inject(FeedsService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);

  dataSource = signal<Feed[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getFeeds().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: this.translate.instant('COMMON.LOAD_ERROR'),
        }),
    });
  }

  openDialog(feed?: Feed): void {
    const ref = this.dialogService.open(FeedDialogComponent, {
      showHeader: false,
      width: '400px',
      data: feed || null,
    });
    ref?.onClose.subscribe((result) => {
      if (result) {
        if (feed) {
          this.service.updateFeed(feed.id, result).subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('COMMON.SUCCESS'),
              detail: this.translate.instant('COMMON.UPDATED_SUCCESS'),
            });
            this.loadData();
          });
        } else {
          this.service.createFeed(result).subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('COMMON.SUCCESS'),
              detail: this.translate.instant('COMMON.SAVED_SUCCESS'),
            });
            this.loadData();
          });
        }
      }
    });
  }

  deleteFeed(id: number): void {
    this.translate.get('COMMON.CONFIRM_DELETE').subscribe((msg) => {
      this.confirmationService.confirm({
        message: msg,
        header: this.translate.instant('COMMON.DELETE'),
        icon: 'pi pi-exclamation-triangle',
        accept: () =>
          this.service.deleteFeed(id).subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('COMMON.SUCCESS'),
              detail: this.translate.instant('COMMON.DELETED_SUCCESS'),
            });
            this.loadData();
          }),
      });
    });
  }
}
