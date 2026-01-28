import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Personnel } from '../../../core/models/master-data.models';

@Component({
  selector: 'app-personnel-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToggleSwitchModule],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
      class="flex flex-col gap-6 pt-2">
      <div class="flex flex-col gap-2">
        <label
          for="fullName"
          class="font-medium">
          Full Name
        </label>
        <input
          pInputText
          id="fullName"
          formControlName="fullName"
          class="w-full"
          [class.ng-invalid]="form.get('fullName')?.invalid && form.get('fullName')?.touched" />
        <small
          class="text-red-500"
          *ngIf="form.get('fullName')?.hasError('required') && form.get('fullName')?.touched">
          Name is required
        </small>
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="jobTitle"
          class="font-medium">
          Job Title
        </label>
        <input
          pInputText
          id="jobTitle"
          formControlName="jobTitle"
          class="w-full" />
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="phoneNumber"
          class="font-medium">
          Phone Number
        </label>
        <input
          pInputText
          id="phoneNumber"
          formControlName="phoneNumber"
          class="w-full" />
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="email"
          class="font-medium">
          Email
        </label>
        <input
          pInputText
          id="email"
          formControlName="email"
          class="w-full" />
        <small
          class="text-red-500"
          *ngIf="form.get('email')?.hasError('email')">
          Invalid email address
        </small>
      </div>

      <div
        class="flex items-center gap-2"
        *ngIf="data">
        <p-toggleswitch
          inputId="isActive"
          formControlName="isActive" />
        <label
          for="isActive"
          class="font-medium">
          Active Personnel
        </label>
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
export class PersonnelDialogComponent {
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  form: FormGroup;
  data: Personnel | null = null;

  constructor() {
    this.data = this.config.data;

    this.form = this.fb.group({
      fullName: [this.data?.fullName || '', Validators.required],
      jobTitle: [this.data?.jobTitle || ''],
      phoneNumber: [this.data?.phoneNumber || ''],
      email: [this.data?.email || '', [Validators.email]],
      isActive: [this.data?.isActive ?? true],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.ref.close(this.form.value);
    }
  }

  onCancel(): void {
    this.ref.close();
  }
}
