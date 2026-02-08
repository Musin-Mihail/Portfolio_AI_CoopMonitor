import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CameraService } from '../../../core/services/camera.service';
import { Camera } from '../../../core/models/camera.models';
import { CameraDialogComponent } from '../camera-dialog/camera-dialog.component';

@Component({
  selector: 'app-camera-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule, TagModule, TranslateModule],
  templateUrl: './camera-list.component.html',
})
export class CameraListComponent implements OnInit {
  private service = inject(CameraService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);

  dataSource = signal<Camera[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getCameras().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: this.translate.instant('COMMON.LOAD_ERROR'),
        }),
    });
  }

  openDialog(camera?: Camera): void {
    const ref = this.dialogService.open(CameraDialogComponent, {
      showHeader: false,
      width: 'golden-sm',
      data: camera || null,
    });

    ref?.onClose.subscribe((result) => {
      if (result) {
        if (camera) {
          this.service.updateCamera(camera.id, result).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Camera updated' });
              this.loadData();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' }),
          });
        } else {
          this.service.createCamera(result).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Camera created' });
              this.loadData();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create' }),
          });
        }
      }
    });
  }

  deleteCamera(id: number): void {
    this.translate.get('COMMON.CONFIRM_DELETE').subscribe((msg) => {
      this.confirmationService.confirm({
        message: msg,
        header: this.translate.instant('COMMON.DELETE'),
        icon: 'pi pi-exclamation-triangle',
        accept: () =>
          this.service.deleteCamera(id).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Camera deleted' });
              this.loadData();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' }),
          }),
      });
    });
  }
}
