import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Feed } from '../../../core/models/master-data.models';

@Component({
  selector: 'app-feed-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Feed' : 'New Feed' }}</h2>
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <mat-form-field appearance="outline">
            <mat-label>Feed Name</mat-label>
            <input
              matInput
              formControlName="name" />
            <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type">
              <mat-option value="Starter">Starter</mat-option>
              <mat-option value="Grower">Grower</mat-option>
              <mat-option value="Finisher">Finisher</mat-option>
              <mat-option value="Supplement">Supplement</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('type')?.hasError('required')">Type is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <textarea
              matInput
              formControlName="description"
              rows="3"></textarea>
          </mat-form-field>
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
export class FeedDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FeedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Feed | null,
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      type: [data?.type || '', Validators.required],
      description: [data?.description || ''],
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
