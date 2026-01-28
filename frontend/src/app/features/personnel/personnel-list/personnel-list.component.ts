import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Personnel } from '../../../core/models/master-data.models';
import { PersonnelService } from '../../../core/services/personnel.service';
import { PersonnelDialogComponent } from '../personnel-dialog/personnel-dialog.component';

@Component({
  selector: 'app-personnel-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule],
  template: `
    <div class="card p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold m-0">Personnel</h1>
        <p-button
          label="Add Personnel"
          icon="pi pi-plus"
          (onClick)="openDialog()" />
      </div>

      <p-table
        [value]="dataSource()"
        [tableStyle]="{ 'min-width': '50rem' }"
        [paginator]="true"
        [rows]="10"
        stripedRows>
        <ng-template pTemplate="header">
          <tr>
            <th
              pSortableColumn="fullName"
              style="width: 25%">
              Name
              <p-sortIcon field="fullName" />
            </th>
            <th
              pSortableColumn="jobTitle"
              style="width: 20%">
              Job Title
              <p-sortIcon field="jobTitle" />
            </th>
            <th style="width: 30%">Contacts</th>
            <th
              pSortableColumn="isActive"
              style="width: 15%">
              Status
              <p-sortIcon field="isActive" />
            </th>
            <th style="width: 10%">Actions</th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          let-person>
          <tr>
            <td class="font-medium">{{ person.fullName }}</td>
            <td>{{ person.jobTitle }}</td>
            <td>
              <div
                *ngIf="person.phoneNumber"
                class="flex items-center gap-2">
                <i class="pi pi-phone text-xs text-slate-500"></i>
                <span>{{ person.phoneNumber }}</span>
              </div>
              <div
                *ngIf="person.email"
                class="flex items-center gap-2 text-sm text-slate-500">
                <i class="pi pi-envelope text-xs"></i>
                <span>{{ person.email }}</span>
              </div>
            </td>
            <td>
              <p-tag
                [value]="person.isActive ? 'Active' : 'Inactive'"
                [severity]="person.isActive ? 'success' : 'danger'"
                [rounded]="true" />
            </td>
            <td>
              <div class="flex gap-2">
                <p-button
                  icon="pi pi-pencil"
                  [rounded]="true"
                  [text]="true"
                  severity="secondary"
                  (onClick)="openDialog(person)" />
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (onClick)="deletePersonnel(person.id)" />
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td
              colspan="5"
              class="text-center p-4">
              No personnel found.
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class PersonnelListComponent implements OnInit {
  private service = inject(PersonnelService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  dataSource = signal<Personnel[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getPersonnels().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error loading personnel' }),
    });
  }

  openDialog(person?: Personnel): void {
    const ref = this.dialogService.open(PersonnelDialogComponent, {
      header: person ? 'Edit Personnel' : 'New Personnel',
      width: '400px',
      data: person || null,
    });

    ref?.onClose.subscribe((result) => {
      if (result) {
        if (person) {
          this.service.updatePersonnel(person.id, { ...person, ...result }).subscribe(() => {
            this.loadData();
            this.showSuccess('Updated successfully');
          });
        } else {
          this.service.createPersonnel(result).subscribe(() => {
            this.loadData();
            this.showSuccess('Created successfully');
          });
        }
      }
    });
  }

  deletePersonnel(id: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this person?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.service.deletePersonnel(id).subscribe({
          next: () => {
            this.loadData();
            this.showSuccess('Deleted successfully');
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' }),
        });
      },
    });
  }

  private showSuccess(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
  }
}
