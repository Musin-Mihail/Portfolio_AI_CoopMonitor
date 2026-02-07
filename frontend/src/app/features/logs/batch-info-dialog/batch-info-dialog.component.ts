import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslateModule } from '@ngx-translate/core';
import { House, Personnel } from '../../../core/models/master-data.models';
import { BatchInfoRecord } from '../../../core/models/logs.models';
import { HousesService } from '../../../core/services/houses.service';
import { PersonnelService } from '../../../core/services/personnel.service';

@Component({
  selector: 'app-batch-info-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    TranslateModule,
  ],
  templateUrl: './batch-info-dialog.component.html',
  styleUrl: './batch-info-dialog.component.scss',
})
export class BatchInfoDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private housesService = inject(HousesService);
  private personnelService = inject(PersonnelService);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  form: FormGroup;
  houses = signal<House[]>([]);
  personnel = signal<Personnel[]>([]);
  data: BatchInfoRecord | null = null;
  title: string = '';

  constructor() {
    this.data = this.config.data;
    this.title = this.data ? 'LOGS_BATCH_INFO.DIALOG_TITLE_EDIT' : 'LOGS_BATCH_INFO.DIALOG_TITLE_ADD';

    this.form = this.fb.group({
      houseId: [null, Validators.required],
      personnelId: [null],
      date: [new Date(), Validators.required],
      deliveryDate: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]],
      birdAgeDays: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.housesService.getHouses().subscribe((data) => this.houses.set(data));
    this.personnelService.getPersonnels().subscribe((data) => this.personnel.set(data));

    if (this.data) {
      this.form.patchValue({
        houseId: this.data.houseId,
        personnelId: this.data.personnelId,
        date: new Date(this.data.date),
        deliveryDate: new Date(this.data.deliveryDate),
        quantity: this.data.quantity,
        birdAgeDays: this.data.birdAgeDays,
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    formValue.date = formValue.date instanceof Date ? formValue.date.toISOString() : formValue.date;
    formValue.deliveryDate =
      formValue.deliveryDate instanceof Date ? formValue.deliveryDate.toISOString() : formValue.deliveryDate;

    this.ref.close(formValue);
  }

  onCancel() {
    this.ref.close();
  }
}
