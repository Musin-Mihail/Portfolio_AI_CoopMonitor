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
  templateUrl: './personnel-list.component.html',
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
          this.service.updatePersonnel(person.id, { ...person, ...result }).subscribe(() => this.loadData());
        } else {
          this.service.createPersonnel(result).subscribe(() => this.loadData());
        }
      }
    });
  }

  deletePersonnel(id: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure?',
      accept: () => this.service.deletePersonnel(id).subscribe(() => this.loadData()),
    });
  }
}
