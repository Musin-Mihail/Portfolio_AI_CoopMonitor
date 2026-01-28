import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FeedWaterService } from '../../../core/services/feed-water.service';
import { FeedWaterRecord } from '../../../core/models/logs.models';
import { FeedWaterDialogComponent } from '../feed-water-dialog/feed-water-dialog.component';

@Component({
  selector: 'app-feed-water-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, SelectModule, FormsModule],
  templateUrl: './feed-water-list.component.html',
})
export class FeedWaterListComponent implements OnInit {
  private service = inject(FeedWaterService);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  dataSource = signal<FeedWaterRecord[]>([]);
  logOptions = [
    { label: 'Падёж', value: '/logs/mortality' },
    { label: 'Корм и вода', value: '/logs/feed-water' },
    { label: 'Болезни', value: '/logs/disease' },
    { label: 'Взвешивание', value: '/logs/weighing' },
    { label: 'Маркировка', value: '/logs/marking' },
  ];
  selectedLog = '/logs/feed-water';

  ngOnInit() {
    this.loadData();
  }
  onLogChange(event: any) {
    this.router.navigate([event.value]);
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
