import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { House } from '../../../core/models/master-data.models';

@Component({
  selector: 'app-house-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit House' : 'New House' }}</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="House #1" />
            <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Area (m²)</mat-label>
            <input matInput type="number" formControlName="area" />
            <mat-error *ngIf="form.get('area')?.hasError('required')">Area is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Capacity (Birds)</mat-label>
            <input matInput type="number" formControlName="capacity" />
            <mat-error *ngIf="form.get('capacity')?.hasError('required')"
              >Capacity is required</mat-error
            >
          </mat-form-field>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
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
export class HouseDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<HouseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: House | null,
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      area: [data?.area || 0, [Validators.required, Validators.min(1)]],
      capacity: [data?.capacity || 0, [Validators.required, Validators.min(1)]],
      configurationJson: [data?.configurationJson || null],
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
