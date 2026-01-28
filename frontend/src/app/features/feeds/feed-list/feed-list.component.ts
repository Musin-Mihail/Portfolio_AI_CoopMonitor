import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Feed } from '../../../core/models/master-data.models';
import { FeedsService } from '../../../core/services/feeds.service';
import { FeedDialogComponent } from '../feed-dialog/feed-dialog.component';

@Component({
  selector: 'app-feed-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './feed-list.component.html',
  styleUrl: './feed-list.component.scss',
})
export class FeedListComponent implements OnInit {
  private service = inject(FeedsService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  dataSource = signal<Feed[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getFeeds().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error loading feeds' }),
    });
  }

  openDialog(feed?: Feed): void {
    const ref = this.dialogService.open(FeedDialogComponent, {
      header: feed ? 'Edit Feed' : 'New Feed',
      width: '400px',
      data: feed || null,
    });

    ref?.onClose.subscribe((result) => {
      if (result) {
        if (feed) {
          this.service.updateFeed(feed.id, result).subscribe(() => {
            this.loadData();
            this.showSuccess('Updated successfully');
          });
        } else {
          this.service.createFeed(result).subscribe(() => {
            this.loadData();
            this.showSuccess('Created successfully');
          });
        }
      }
    });
  }

  deleteFeed(id: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this feed?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.service.deleteFeed(id).subscribe({
          next: () => {
            this.loadData();
            this.showSuccess('Deleted successfully');
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' }),
        });
      },
    });
  }

  private showSuccess(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
  }
}
