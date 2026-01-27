import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { HousesService } from '../../../core/services/houses.service';
import { PersonnelService } from '../../../core/services/personnel.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-weighing-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>New Weighing Record</h2>
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <div class="row">
            <mat-form-field
              appearance="outline"
              class="half-width">
              <mat-label>House</mat-label>
              <mat-select formControlName="houseId">
                <mat-option
                  *ngFor="let h of houses()"
                  [value]="h.id">
                  {{ h.name }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="form.get('houseId')?.hasError('required')">Required</mat-error>
            </mat-form-field>

            <mat-form-field
              appearance="outline"
              class="half-width">
              <mat-label>Responsible</mat-label>
              <mat-select formControlName="personnelId">
                <mat-option
                  *ngFor="let p of personnel()"
                  [value]="p.id">
                  {{ p.fullName }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input
              matInput
              [matDatepicker]="picker"
              formControlName="date" />
            <mat-datepicker-toggle
              matIconSuffix
              [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="form.get('date')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Weight (grams)</mat-label>
            <input
              matInput
              type="number"
              formControlName="weightGrams" />
            <mat-error *ngIf="form.get('weightGrams')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <div class="checkbox-container">
            <mat-checkbox
              formControlName="isMusicPlayed"
              color="primary">
              Calming Music Played (Stress Reduction)
            </mat-checkbox>
          </div>

          <div class="file-upload">
            <label>Video Evidence (Required)</label>
            <div class="file-input-wrapper">
              <button
                type="button"
                mat-stroked-button
                (click)="fileInput.click()">
                <mat-icon>videocam</mat-icon>
                Select Video
              </button>
              <span class="file-name">{{ selectedFile?.name || 'No file selected' }}</span>
              <input
                #fileInput
                type="file"
                accept="video/*"
                (change)="onFileSelected($event)"
                style="display: none;" />
            </div>
            <mat-error
              *ngIf="form.hasError('fileRequired') && form.touched"
              class="custom-error">
              Video evidence is mandatory
            </mat-error>
          </div>
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
          Save Record
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
        min-width: 400px;
      }
      .row {
        display: flex;
        gap: 16px;
      }
      .half-width {
        flex: 1;
      }
      mat-form-field {
        width: 100%;
      }
      .checkbox-container {
        margin-bottom: 10px;
      }
      .file-upload {
        display: flex;
        flex-direction: column;
        gap: 8px;
        label {
          font-weight: 500;
          color: rgba(0, 0, 0, 0.6);
        }
      }
      .file-input-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .file-name {
        font-size: 0.9rem;
        color: #555;
      }
      .custom-error {
        font-size: 0.75rem;
        color: #f44336;
        margin-top: 4px;
      }
    `,
  ],
})
export class WeighingDialogComponent {
  private fb = inject(FormBuilder);
  private housesService = inject(HousesService);
  private personnelService = inject(PersonnelService);
  public dialogRef = inject(MatDialogRef<WeighingDialogComponent>);

  houses = toSignal(this.housesService.getHouses());
  personnel = toSignal(this.personnelService.getPersonnels());

  selectedFile: File | null = null;

  form: FormGroup = this.fb.group(
    {
      houseId: ['', Validators.required],
      personnelId: [null],
      date: [new Date(), Validators.required],
      weightGrams: ['', [Validators.required, Validators.min(1)]],
      isMusicPlayed: [false],
    },
    { validators: this.fileRequiredValidator.bind(this) },
  );

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.form.updateValueAndValidity(); // Trigger validation
    }
  }

  // Custom validator for file
  fileRequiredValidator(group: FormGroup) {
    return this.selectedFile ? null : { fileRequired: true };
  }

  onSubmit() {
    if (this.form.valid && this.selectedFile) {
      const result = {
        ...this.form.value,
        videoFile: this.selectedFile,
        date: this.form.value.date.toISOString(),
      };
      this.dialogRef.close(result);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
