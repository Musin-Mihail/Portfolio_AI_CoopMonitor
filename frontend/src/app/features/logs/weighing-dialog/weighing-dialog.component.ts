import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { House, Personnel } from '../../../core/models/master-data.models';
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
  ],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
      class="flex flex-col gap-5 pt-2">
      <div class="flex flex-row gap-4">
        <div class="flex-1 flex flex-col gap-2">
          <label
            for="houseId"
            class="font-medium">
            House
          </label>
          <p-select
            id="houseId"
            formControlName="houseId"
            [options]="houses()"
            optionLabel="name"
            optionValue="id"
            placeholder="Select House"
            styleClass="w-full" />
          <small
            class="text-red-500"
            *ngIf="form.get('houseId')?.hasError('required') && form.get('houseId')?.touched">
            Required
          </small>
        </div>

        <div class="flex-1 flex flex-col gap-2">
          <label
            for="personnelId"
            class="font-medium">
            Responsible
          </label>
          <p-select
            id="personnelId"
            formControlName="personnelId"
            [options]="personnel()"
            optionLabel="fullName"
            optionValue="id"
            placeholder="Select Person"
            styleClass="w-full" />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="date"
          class="font-medium">
          Date
        </label>
        <p-datepicker
          id="date"
          formControlName="date"
          dateFormat="yy-mm-dd"
          appendTo="body"
          styleClass="w-full"
          [showIcon]="true" />
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="weightGrams"
          class="font-medium">
          Weight (grams)
        </label>
        <input
          pInputText
          id="weightGrams"
          type="number"
          formControlName="weightGrams"
          class="w-full" />
        <small
          class="text-red-500"
          *ngIf="form.get('weightGrams')?.hasError('required') && form.get('weightGrams')?.touched">
          Weight is required
        </small>
      </div>

      <div class="flex items-center gap-2 mt-2">
        <p-checkbox
          formControlName="isMusicPlayed"
          [binary]="true"
          inputId="music" />
        <label
          for="music"
          class="cursor-pointer select-none">
          Calming Music Played (Stress Reduction)
        </label>
      </div>

      <div class="flex flex-col gap-2">
        <label class="font-medium">Video Evidence (Required)</label>
        <div class="flex items-center gap-3 border border-slate-200 p-3 rounded bg-slate-50">
          <button
            pButton
            type="button"
            icon="pi pi-video"
            label="Select Video"
            class="p-button-outlined p-button-secondary p-button-sm"
            (click)="fileInput.click()"></button>
          <span class="text-sm text-slate-600 truncate max-w-[200px]">
            {{ selectedFile?.name || 'No file selected' }}
          </span>
          <input
            #fileInput
            type="file"
            (change)="onFileSelected($event)"
            style="display: none"
            accept="video/*" />
        </div>
        <small
          class="text-red-500"
          *ngIf="form.hasError('fileRequired') && form.touched">
          Video evidence is mandatory
        </small>
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <p-button
          label="Cancel"
          severity="secondary"
          [text]="true"
          (onClick)="onCancel()" />
        <p-button
          label="Save"
          type="submit"
          [disabled]="form.invalid" />
      </div>
    </form>
  `,
})
export class WeighingDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private housesService = inject(HousesService);
  private personnelService = inject(PersonnelService);
  public ref = inject(DynamicDialogRef);

  form: FormGroup;
  houses = signal<House[]>([]);
  personnel = signal<Personnel[]>([]);
  selectedFile: File | null = null;

  constructor() {
    this.form = this.fb.group(
      {
        houseId: [null, Validators.required],
        personnelId: [null],
        date: [new Date(), Validators.required],
        weightGrams: [null, [Validators.required, Validators.min(1)]],
        isMusicPlayed: [false],
      },
      { validators: this.fileRequiredValidator.bind(this) },
    );
  }

  ngOnInit() {
    this.housesService.getHouses().subscribe((data) => this.houses.set(data));
    this.personnelService.getPersonnels().subscribe((data) => this.personnel.set(data));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.form.updateValueAndValidity();
    }
  }

  fileRequiredValidator(group: FormGroup) {
    return this.selectedFile ? null : { fileRequired: true };
  }

  onSubmit() {
    if (this.form.valid && this.selectedFile) {
      const result = {
        ...this.form.value,
        videoFile: this.selectedFile,
        // Ensure date is ISO string for backend
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
