import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HousesService } from '../../../core/services/houses.service';
import { House } from '../../../core/models/master-data.models';
import { HouseDialogComponent } from '../house-dialog/house-dialog.component';

@Component({
  selector: 'app-house-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule, TranslateModule],
  templateUrl: './house-list.component.html',
})
export class HouseListComponent implements OnInit {
  private service = inject(HousesService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);

  dataSource = signal<House[]>([]);

  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedHouseId: number | null = null;

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.service.getHouses().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: this.translate.instant('COMMON.LOAD_ERROR'),
        }),
    });
  }

  triggerUpload(houseId: number) {
    this.selectedHouseId = houseId;
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.selectedHouseId) {
      this.messageService.add({ severity: 'info', summary: 'Uploading...', detail: 'Importing sensor data.' });

      this.service.importData(this.selectedHouseId, file).subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: res.message || 'Data imported successfully',
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to import data. Check CSV format.',
          });
        },
      });
    }
  }

  openDialog(house?: House) {
    const ref = this.dialogService.open(HouseDialogComponent, {
      showHeader: false,
      width: '400px',
      data: house || null,
    });

    ref?.onClose.subscribe((result) => {
      if (result) {
        if (house) {
          this.service.updateHouse(house.id, result).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('COMMON.SUCCESS'),
                detail: this.translate.instant('COMMON.UPDATED_SUCCESS'),
              });
              this.load();
            },
            error: () =>
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('COMMON.ERROR'),
                detail: this.translate.instant('COMMON.MESSAGES.FAILED_UPDATE'),
              }),
          });
        } else {
          this.service.createHouse(result).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('COMMON.SUCCESS'),
                detail: this.translate.instant('COMMON.SAVED_SUCCESS'),
              });
              this.load();
            },
            error: () =>
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('COMMON.ERROR'),
                detail: this.translate.instant('COMMON.MESSAGES.FAILED_CREATE'),
              }),
          });
        }
      }
    });
  }

  deleteHouse(id: number) {
    this.translate.get('COMMON.CONFIRM_DELETE').subscribe((msg) => {
      this.confirmationService.confirm({
        message: msg,
        header: this.translate.instant('COMMON.DELETE'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.service.deleteHouse(id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('COMMON.SUCCESS'),
                detail: this.translate.instant('COMMON.DELETED_SUCCESS'),
              });
              this.load();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('COMMON.ERROR'),
                detail: this.translate.instant('COMMON.MESSAGES.FAILED_DELETE'),
              });
            },
          });
        },
      });
    });
  }
}
