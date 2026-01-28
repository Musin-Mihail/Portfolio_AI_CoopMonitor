import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { House } from '../../../core/models/master-data.models';

@Component({
  selector: 'app-house-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
      class="flex flex-col gap-6 pt-2">
      <div class="flex flex-col gap-2">
        <label
          for="name"
          class="font-medium text-slate-700 dark:text-slate-300">
          Name
        </label>
        <input
          pInputText
          id="name"
          formControlName="name"
          placeholder="House #1"
          [class.ng-invalid]="form.get('name')?.invalid && form.get('name')?.touched" />
        <small
          class="text-red-500"
          *ngIf="form.get('name')?.hasError('required') && form.get('name')?.touched">
          Name is required
        </small>
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="area"
          class="font-medium text-slate-700 dark:text-slate-300">
          Area (m²)
        </label>
        <input
          pInputText
          id="area"
          type="number"
          formControlName="area" />
        <small
          class="text-red-500"
          *ngIf="form.get('area')?.hasError('required') && form.get('area')?.touched">
          Area is required
        </small>
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="capacity"
          class="font-medium text-slate-700 dark:text-slate-300">
          Capacity (Birds)
        </label>
        <input
          pInputText
          id="capacity"
          type="number"
          formControlName="capacity" />
        <small
          class="text-red-500"
          *ngIf="form.get('capacity')?.hasError('required') && form.get('capacity')?.touched">
          Capacity is required
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
export class HouseDialogComponent {
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  form: FormGroup;
  data: House | null = null;

  constructor() {
    this.data = this.config.data;

    this.form = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      area: [this.data?.area || 0, [Validators.required, Validators.min(1)]],
      capacity: [this.data?.capacity || 0, [Validators.required, Validators.min(1)]],
      configurationJson: [this.data?.configurationJson || null],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.ref.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.ref.close();
  }
}
