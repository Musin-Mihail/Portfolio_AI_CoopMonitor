import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { House, Personnel } from '../../../core/models/master-data.models';
import { HousesService } from '../../../core/services/houses.service';
import { PersonnelService } from '../../../core/services/personnel.service';

@Component({
  selector: 'app-marking-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, DatePickerModule],
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

      <div class="flex flex-row gap-4">
        <div class="flex-1 flex flex-col gap-2">
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

        <div class="flex-1 flex flex-col gap-2">
          <label
            for="birdAgeDays"
            class="font-medium">
            Bird Age (Days)
          </label>
          <input
            pInputText
            id="birdAgeDays"
            type="number"
            formControlName="birdAgeDays"
            (input)="onAgeChange()"
            class="w-full" />
        </div>
      </div>

      <div class="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md flex items-center gap-2">
        <i class="pi pi-info-circle text-lg"></i>
        <span>
          Protocol for age
          <strong>{{ age() }}</strong>
          days:
          <strong>{{ isOlder() ? 'Tape + Number' : 'Paint + Ring' }}</strong>
        </span>
      </div>

      <div class="border border-dashed border-slate-300 p-4 rounded-md">
        <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {{ isOlder() ? 'Tape & Number Protocol' : 'Paint & Ring Protocol' }}
        </h3>
        <div class="flex flex-row gap-4">
          <div class="flex-1 flex flex-col gap-2">
            <label
              for="color"
              class="font-medium">
              {{ isOlder() ? 'Tape Color' : 'Paint Color' }}
            </label>
            <input
              pInputText
              id="color"
              formControlName="color"
              [placeholder]="isOlder() ? 'e.g. Blue Tape' : 'e.g. Red Strip'"
              class="w-full" />
          </div>
          <div class="flex-1 flex flex-col gap-2">
            <label
              for="ringNumber"
              class="font-medium">
              {{ isOlder() ? 'Painted Number' : 'Ring Number' }}
            </label>
            <input
              pInputText
              id="ringNumber"
              formControlName="ringNumber"
              [placeholder]="isOlder() ? 'Big digits on back' : 'Optional'"
              class="w-full" />
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="birdIdentifier"
          class="font-medium">
          Bird Identifier (Optional)
        </label>
        <input
          pInputText
          id="birdIdentifier"
          formControlName="birdIdentifier"
          placeholder="Internal ID"
          class="w-full" />
      </div>

      <div class="flex flex-col gap-2">
        <label class="font-medium">Photo Evidence (Recommended)</label>
        <div class="flex items-center gap-3 border border-slate-200 p-3 rounded bg-slate-50">
          <button
            pButton
            type="button"
            icon="pi pi-camera"
            label="Select Photo"
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
            accept="image/*" />
        </div>
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
export class MarkingDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private housesService = inject(HousesService);
  private personnelService = inject(PersonnelService);
  public ref = inject(DynamicDialogRef);

  form: FormGroup;
  houses = signal<House[]>([]);
  personnel = signal<Personnel[]>([]);
  selectedFile: File | null = null;
  age = signal<number>(0);
  isOlder = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      houseId: [null, Validators.required],
      personnelId: [null],
      date: [new Date(), Validators.required],
      birdAgeDays: [0, [Validators.required, Validators.min(0)]],
      birdIdentifier: [''],
      color: [''],
      ringNumber: [''],
    });
  }

  ngOnInit() {
    this.housesService.getHouses().subscribe((data) => this.houses.set(data));
    this.personnelService.getPersonnels().subscribe((data) => this.personnel.set(data));
  }

  onAgeChange() {
    const ageVal = this.form.get('birdAgeDays')?.value || 0;
    this.age.set(ageVal);
    this.isOlder.set(ageVal >= 14);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const markingType = this.isOlder() ? 'TapeNumber' : 'PaintRing';

      const result = {
        ...this.form.value,
        markingType: markingType,
        photoFile: this.selectedFile,
        // Ensure date is ISO
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
