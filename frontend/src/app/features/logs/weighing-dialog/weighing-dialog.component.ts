import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { TranslateModule } from '@ngx-translate/core';
import { House, Personnel } from '../../../core/models/master-data.models';
import { WeighingRecord } from '../../../core/models/logs.models';
import { HousesService } from '../../../core/services/houses.service';
import { PersonnelService } from '../../../core/services/personnel.service';

@Component({
  selector: 'app-weighing-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    CheckboxModule,
    InputNumberModule,
    TextareaModule,
    TranslateModule,
  ],
  templateUrl: './weighing-dialog.component.html',
  styleUrl: './weighing-dialog.component.scss',
})
export class WeighingDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private housesService = inject(HousesService);
  private personnelService = inject(PersonnelService);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  form: FormGroup;
  houses = signal<House[]>([]);
  personnel = signal<Personnel[]>([]);
  selectedFile: File | null = null;
  data: WeighingRecord | null = null;
  title: string = '';

  constructor() {
    this.data = this.config.data;
    this.title = this.data ? 'LOGS_WEIGHING.DIALOG_TITLE_EDIT' : 'LOGS_WEIGHING.DIALOG_TITLE_ADD';

    this.form = this.fb.group(
      {
        houseId: [null, Validators.required],
        personnelId: [null],
        date: [new Date(), Validators.required],
        weightGrams: [null, [Validators.required, Validators.min(1)]],
        isMusicPlayed: [false],
        // New
        birdIdentifier: [''],
        temperature: [null],
        updateMarking: [false],
        symptoms: [''],
        actions: [''],
        vetPrescriptions: [''],
        notes: [''],
      },
      { validators: this.fileRequiredValidator.bind(this) },
    );
  }

  ngOnInit() {
    this.housesService.getHouses().subscribe((data) => this.houses.set(data));
    this.personnelService.getPersonnels().subscribe((data) => this.personnel.set(data));

    if (this.data) {
      this.form.patchValue({
        houseId: this.data.houseId,
        personnelId: this.data.personnelId,
        date: new Date(this.data.date),
        weightGrams: this.data.weightGrams,
        isMusicPlayed: this.data.isMusicPlayed,
        // New
        birdIdentifier: this.data.birdIdentifier,
        temperature: this.data.temperature,
        updateMarking: this.data.updateMarking,
        symptoms: this.data.symptoms,
        actions: this.data.actions,
        vetPrescriptions: this.data.vetPrescriptions,
        notes: this.data.notes,
      });
      this.form.updateValueAndValidity();
    }
  }

  toggleCheckbox(controlName: string) {
    const val = this.form.get(controlName)?.value;
    this.form.get(controlName)?.setValue(!val);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.form.updateValueAndValidity();
    }
  }

  fileRequiredValidator(group: FormGroup) {
    if (this.data?.videoUrl) {
      return null;
    }
    return this.selectedFile ? null : { fileRequired: true };
  }

  onSubmit() {
    if (this.form.valid) {
      const result = {
        ...this.form.value,
        videoFile: this.selectedFile,
        date: this.form.value.date instanceof Date ? this.form.value.date.toISOString() : this.form.value.date,
      };
      this.ref.close(result);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel() {
    this.ref.close();
  }
}
