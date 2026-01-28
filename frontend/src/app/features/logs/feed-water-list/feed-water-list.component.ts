import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FeedWaterService } from '../../../core/services/feed-water.service';
import { FeedWaterRecord } from '../../../core/models/logs.models';
import { FeedWaterDialogComponent } from '../feed-water-dialog/feed-water-dialog.component';

@Component({
  selector: 'app-feed-water-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './feed-water-list.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class FeedWaterListComponent implements OnInit {
  private service = inject(FeedWaterService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  dataSource = signal<FeedWaterRecord[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.getRecords().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.showError('Error loading records'),
    });
  }

  openDialog() {
    const ref = this.dialogService.open(FeedWaterDialogComponent, {
      header: 'Add Feed & Water Record',
      width: '500px',
      modal: true,
      closable: true,
    });

    ref?.onClose.subscribe((result) => {
      if (result) {
        this.service.createRecord(result).subscribe({
          next: () => {
            this.loadData();
            this.showSuccess('Record added successfully');
          },
          error: () => this.showError('Error creating record'),
        });
      }
    });
  }

  deleteRecord(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this record?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.service.deleteRecord(id).subscribe({
          next: () => {
            this.loadData();
            this.showSuccess('Record deleted');
          },
          error: () => this.showError('Error deleting record'),
        });
      },
    });
  }

  private showSuccess(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
  }

  private showError(msg: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
  }
}
