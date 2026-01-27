import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Personnel } from '../../../core/models/master-data.models';
import { PersonnelService } from '../../../core/services/personnel.service';
import { PersonnelDialogComponent } from '../personnel-dialog/personnel-dialog.component';

@Component({
  selector: 'app-personnel-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Personnel</h1>
        <button
          mat-flat-button
          color="primary"
          (click)="openDialog()">
          <mat-icon>add</mat-icon>
          Add Personnel
        </button>
      </div>

      <table
        mat-table
        [dataSource]="dataSource()"
        class="mat-elevation-z8">
        <ng-container matColumnDef="fullName">
          <th
            mat-header-cell
            *matHeaderCellDef>
            Name
          </th>
          <td
            mat-cell
            *matCellDef="let element">
            {{ element.fullName }}
          </td>
        </ng-container>

        <ng-container matColumnDef="jobTitle">
          <th
            mat-header-cell
            *matHeaderCellDef>
            Job Title
          </th>
          <td
            mat-cell
            *matCellDef="let element">
            {{ element.jobTitle }}
          </td>
        </ng-container>

        <ng-container matColumnDef="contacts">
          <th
            mat-header-cell
            *matHeaderCellDef>
            Contacts
          </th>
          <td
            mat-cell
            *matCellDef="let element">
            <div *ngIf="element.phoneNumber">{{ element.phoneNumber }}</div>
            <div
              *ngIf="element.email"
              style="font-size: 0.8em; color: gray;">
              {{ element.email }}
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th
            mat-header-cell
            *matHeaderCellDef>
            Status
          </th>
          <td
            mat-cell
            *matCellDef="let element">
            <span [style.color]="element.isActive ? 'green' : 'red'">
              {{ element.isActive ? 'Active' : 'Inactive' }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th
            mat-header-cell
            *matHeaderCellDef>
            Actions
          </th>
          <td
            mat-cell
            *matCellDef="let element">
            <button
              mat-icon-button
              color="primary"
              (click)="openDialog(element)">
              <mat-icon>edit</mat-icon>
            </button>
            <button
              mat-icon-button
              color="warn"
              (click)="deletePersonnel(element.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr
          mat-header-row
          *matHeaderRowDef="displayedColumns"></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 0;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      h1 {
        margin: 0;
      }
      table {
        width: 100%;
      }
    `,
  ],
})
export class PersonnelListComponent implements OnInit {
  private service = inject(PersonnelService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['fullName', 'jobTitle', 'contacts', 'status', 'actions'];
  dataSource = signal<Personnel[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getPersonnels().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.snackBar.open('Error loading personnel', 'Close', { duration: 3000 }),
    });
  }

  openDialog(person?: Personnel): void {
    const dialogRef = this.dialog.open(PersonnelDialogComponent, {
      width: '400px',
      data: person || null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (person) {
          this.service.updatePersonnel(person.id, { ...person, ...result }).subscribe(() => {
            this.loadData();
            this.snackBar.open('Updated successfully', 'Close', { duration: 3000 });
          });
        } else {
          this.service.createPersonnel(result).subscribe(() => {
            this.loadData();
            this.snackBar.open('Created successfully', 'Close', { duration: 3000 });
          });
        }
      }
    });
  }

  deletePersonnel(id: number): void {
    if (confirm('Are you sure?')) {
      this.service.deletePersonnel(id).subscribe(() => {
        this.loadData();
        this.snackBar.open('Deleted successfully', 'Close', { duration: 3000 });
      });
    }
  }
}
