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
import { MortalityService } from '../../../core/services/mortality.service';
import { MortalityRecord } from '../../../core/models/logs.models';
import { MortalityDialogComponent } from '../mortality-dialog/mortality-dialog.component';
import { FileUploadService } from '../../../core/services/file-upload.service';

@Component({
  selector: 'app-mortality-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, SelectModule, FormsModule, TooltipModule],
  templateUrl: './mortality-list.component.html',
  styleUrl: './mortality-list.component.scss',
})
export class MortalityListComponent implements OnInit {
  private service = inject(MortalityService);
  private router = inject(Router);
  private fileService = inject(FileUploadService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  dataSource = signal<MortalityRecord[]>([]);

  logOptions = [
    { label: 'Падёж', value: '/logs/mortality' },
    { label: 'Корм и вода', value: '/logs/feed-water' },
    { label: 'Болезни', value: '/logs/disease' },
    { label: 'Взвешивание', value: '/logs/weighing' },
    { label: 'Маркировка', value: '/logs/marking' },
  ];
  selectedLog = '/logs/mortality';

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
  openDialog(): void {
    const ref = this.dialogService.open(MortalityDialogComponent, {
      header: 'Add Mortality Record',
      width: '450px',
      modal: true,
    });
    ref?.onClose.subscribe((res) => res && this.service.createRecord(res).subscribe(() => this.loadData()));
  }
  deleteRecord(id: number): void {
    this.confirmationService.confirm({
      message: 'Delete record?',
      accept: () => this.service.deleteRecord(id).subscribe(() => this.loadData()),
    });
  }
  viewPhoto(url: string | undefined): void {
    if (!url) return;
    const [bucket, ...rest] = url.split('/');
    window.open(this.fileService.getDownloadUrl(bucket, rest.join('/')), '_blank');
  }
}
