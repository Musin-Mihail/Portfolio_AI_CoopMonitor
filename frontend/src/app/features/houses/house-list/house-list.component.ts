import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip'; // Import
import { TranslateModule, TranslateService } from '@ngx-translate/core'; // Import
import { HousesService } from '../../../core/services/houses.service';
import { House } from '../../../core/models/master-data.models';
import { HouseDialogComponent } from '../house-dialog/house-dialog.component';

@Component({
  selector: 'app-house-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule, TranslateModule], // Add Module
  templateUrl: './house-list.component.html',
})
export class HouseListComponent implements OnInit {
  private service = inject(HousesService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService); // Inject

  dataSource = signal<House[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.service.getHouses().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load houses' }),
    });
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
          this.service.updateHouse(house.id, result).subscribe(() => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'House updated' });
            this.load();
          });
        } else {
          this.service.createHouse(result).subscribe(() => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'House created' });
            this.load();
          });
        }
      }
    });
  }

  deleteHouse(id: number) {
    // Получаем переведенный текст подтверждения
    this.translate.get('COMMON.CONFIRM_DELETE').subscribe((msg) => {
      this.confirmationService.confirm({
        message: msg,
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.service.deleteHouse(id).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'House deleted' });
              this.load();
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete house' });
            },
          });
        },
      });
    });
  }
}
