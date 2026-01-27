import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Personnel } from '../../../core/models/master-data.models';

@Component({
  selector: 'app-personnel-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Personnel' : 'New Personnel' }}</h2>
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <mat-form-field appearance="outline">
            <mat-label>Full Name</mat-label>
            <input
              matInput
              formControlName="fullName" />
            <mat-error *ngIf="form.get('fullName')?.hasError('required')">Name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Job Title</mat-label>
            <input
              matInput
              formControlName="jobTitle" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Phone Number</mat-label>
            <input
              matInput
              formControlName="phoneNumber" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input
              matInput
              formControlName="email" />
            <mat-error *ngIf="form.get('email')?.hasError('email')">Invalid email</mat-error>
          </mat-form-field>

          <mat-slide-toggle
            formControlName="isActive"
            *ngIf="data">
            Active
          </mat-slide-toggle>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button
          mat-button
          type="button"
          (click)="onCancel()">
          Cancel
        </button>
        <button
          mat-flat-button
          color="primary"
          type="submit"
          [disabled]="form.invalid">
          Save
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 300px;
      }
      mat-form-field {
        width: 100%;
      }
    `,
  ],
})
export class PersonnelDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PersonnelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Personnel | null,
  ) {
    this.form = this.fb.group({
      fullName: [data?.fullName || '', Validators.required],
      jobTitle: [data?.jobTitle || ''],
      phoneNumber: [data?.phoneNumber || ''],
      email: [data?.email || '', [Validators.email]],
      isActive: [data?.isActive ?? true],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
