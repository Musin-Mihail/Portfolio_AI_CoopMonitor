import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Feed } from '../../../core/models/master-data.models';
import { FeedsService } from '../../../core/services/feeds.service';
import { FeedDialogComponent } from '../feed-dialog/feed-dialog.component';

@Component({
  selector: 'app-feed-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, SelectModule, FormsModule],
  templateUrl: './feed-list.component.html',
})
export class FeedListComponent implements OnInit {
  private service = inject(FeedsService);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  dataSource = signal<Feed[]>([]);
  masterDataOptions = [
    { label: 'Птичники', value: '/master-data/houses' },
    { label: 'Персонал', value: '/master-data/personnel' },
    { label: 'Корма', value: '/master-data/feeds' },
  ];
  selectedOption = '/master-data/feeds';

  ngOnInit(): void {
    this.loadData();
  }
  onOptionChange(e: any) {
    this.router.navigate([e.value]);
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
          this.service.updateFeed(feed.id, result).subscribe(() => this.loadData());
        } else {
          this.service.createFeed(result).subscribe(() => this.loadData());
        }
      }
    });
  }

  deleteFeed(id: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure?',
      accept: () => this.service.deleteFeed(id).subscribe(() => this.loadData()),
    });
  }
}
