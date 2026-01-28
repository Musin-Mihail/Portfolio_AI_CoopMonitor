import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { House } from '../../../core/models/master-data.models';
import { HousesService } from '../../../core/services/houses.service';
import { HouseDialogComponent } from '../house-dialog/house-dialog.component';

@Component({
  selector: 'app-house-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './house-list.component.html',
  styleUrls: ['./house-list.component.scss'],
})
export class HouseListComponent implements OnInit {
  private housesService = inject(HousesService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  dataSource = signal<House[]>([]);

  ngOnInit(): void {
    this.loadHouses();
  }

  loadHouses(): void {
    this.housesService.getHouses().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.showError('Failed to load houses'),
    });
  }

  openDialog(house?: House): void {
    const ref = this.dialogService.open(HouseDialogComponent, {
      header: house ? 'Edit House' : 'New House',
      width: '400px',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: false,
      data: house || null,
    });

    ref?.onClose.subscribe((result) => {
      if (result) {
        if (house) {
          this.updateHouse(house.id, result);
        } else {
          this.createHouse(result);
        }
      }
    });
  }

  createHouse(houseData: any): void {
    this.housesService.createHouse(houseData).subscribe({
      next: () => {
        this.loadHouses();
        this.showSuccess('House created successfully');
      },
      error: () => this.showError('Failed to create house'),
    });
  }

  updateHouse(id: number, houseData: any): void {
    this.housesService.updateHouse(id, houseData).subscribe({
      next: () => {
        this.loadHouses();
        this.showSuccess('House updated successfully');
      },
      error: () => this.showError('Failed to update house'),
    });
  }

  deleteHouse(id: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this house?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.housesService.deleteHouse(id).subscribe({
          next: () => {
            this.loadHouses();
            this.showSuccess('House deleted successfully');
          },
          error: () => this.showError('Failed to delete house'),
        });
      },
    });
  }

  private showSuccess(message: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
  }

  private showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
  }
}
