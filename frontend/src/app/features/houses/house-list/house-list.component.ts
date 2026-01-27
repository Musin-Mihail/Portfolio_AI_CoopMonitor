import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { House } from '../../../core/models/master-data.models';
import { HousesService } from '../../../core/services/houses.service';
import { HouseDialogComponent } from '../house-dialog/house-dialog.component';

@Component({
  selector: 'app-house-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './house-list.component.html',
  styleUrls: ['./house-list.component.scss'],
})
export class HouseListComponent implements OnInit {
  private housesService = inject(HousesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['id', 'name', 'area', 'capacity', 'actions'];
  dataSource = signal<House[]>([]);

  ngOnInit(): void {
    this.loadHouses();
  }

  loadHouses(): void {
    this.housesService.getHouses().subscribe({
      next: (data) => this.dataSource.set(data),
      error: (err) => this.showError('Failed to load houses'),
    });
  }

  openDialog(house?: House): void {
    const dialogRef = this.dialog.open(HouseDialogComponent, {
      width: '400px',
      data: house || null,
    });

    dialogRef.afterClosed().subscribe((result) => {
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
    if (confirm('Are you sure you want to delete this house?')) {
      this.housesService.deleteHouse(id).subscribe({
        next: () => {
          this.loadHouses();
          this.showSuccess('House deleted successfully');
        },
        error: () => this.showError('Failed to delete house'),
      });
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
  }
}
