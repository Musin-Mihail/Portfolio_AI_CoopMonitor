import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { MarkingService } from '../../../core/services/marking.service';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { MarkingRecord } from '../../../core/models/logs.models';
import { MarkingDialogComponent } from '../marking-dialog/marking-dialog.component';

@Component({
  selector: 'app-marking-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, SelectModule, FormsModule, TooltipModule],
  templateUrl: './marking-list.component.html',
})
export class MarkingListComponent implements OnInit {
  private service = inject(MarkingService);
  private fileService = inject(FileUploadService);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  dataSource = signal<MarkingRecord[]>([]);
  logOptions = [
    { label: 'Падёж', value: '/logs/mortality' },
    { label: 'Корм и вода', value: '/logs/feed-water' },
    { label: 'Болезни', value: '/logs/disease' },
    { label: 'Взвешивание', value: '/logs/weighing' },
    { label: 'Маркировка', value: '/logs/marking' },
  ];
  selectedLog = '/logs/marking';

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
    const ref = this.dialogService.open(MarkingDialogComponent, {
      header: 'New Marking Record',
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

  viewPhoto(url: string | undefined): void {
    if (!url) return;
    const [bucket, ...rest] = url.split('/');
    const fullUrl = this.fileService.getDownloadUrl(bucket, rest.join('/'));
    window.open(fullUrl, '_blank');
  }
}
