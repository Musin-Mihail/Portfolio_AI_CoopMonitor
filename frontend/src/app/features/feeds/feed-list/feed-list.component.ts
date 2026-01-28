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
  template: `
    <div class="card p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold m-0">Feeds</h1>
        <p-button
          label="Add Feed"
          icon="pi pi-plus"
          (onClick)="openDialog()" />
      </div>

      <p-table
        [value]="dataSource()"
        [tableStyle]="{ 'min-width': '50rem' }"
        [paginator]="true"
        [rows]="10"
        stripedRows>
        <ng-template pTemplate="header">
          <tr>
            <th
              pSortableColumn="name"
              style="width: 25%">
              Name
              <p-sortIcon field="name" />
            </th>
            <th
              pSortableColumn="type"
              style="width: 25%">
              Type
              <p-sortIcon field="type" />
            </th>
            <th style="width: 40%">Description</th>
            <th style="width: 10%">Actions</th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          let-feed>
          <tr>
            <td class="font-medium">{{ feed.name }}</td>
            <td>
              <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-medium">{{ feed.type }}</span>
            </td>
            <td class="text-slate-600">{{ feed.description }}</td>
            <td>
              <div class="flex gap-2">
                <p-button
                  icon="pi pi-pencil"
                  [rounded]="true"
                  [text]="true"
                  severity="secondary"
                  (onClick)="openDialog(feed)" />
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (onClick)="deleteFeed(feed.id)" />
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td
              colspan="4"
              class="text-center p-4">
              No feeds found.
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
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
