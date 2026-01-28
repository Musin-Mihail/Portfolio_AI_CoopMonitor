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
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error loading records' }),
    });
  }

  openDialog() {
    const ref = this.dialogService.open(FeedWaterDialogComponent, {
      header: 'Add Feed & Water Record',
      width: '500px',
      modal: true,
    });
    ref?.onClose.subscribe((result) => {
      if (result) this.service.createRecord(result).subscribe(() => this.loadData());
    });
  }

  deleteRecord(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure?',
      accept: () => this.service.deleteRecord(id).subscribe(() => this.loadData()),
    });
  }
}
