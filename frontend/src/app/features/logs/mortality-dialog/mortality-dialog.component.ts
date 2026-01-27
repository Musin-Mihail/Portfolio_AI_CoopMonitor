import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { House, Personnel } from '../../../core/models/master-data.models';
import { HousesService } from '../../../core/services/houses.service';
import { PersonnelService } from '../../../core/services/personnel.service';
import { FileUploadService } from '../../../core/services/file-upload.service';

@Component({
  selector: 'app-mortality-dialog',
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
    MatIconModule,
    MatProgressBarModule,
  ],
  template: `
    <h2 mat-dialog-title>New Mortality Record</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <mat-form-field appearance="outline">
            <mat-label>House</mat-label>
            <mat-select formControlName="houseId">
              <mat-option *ngFor="let h of houses" [value]="h.id">{{ h.name }}</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('houseId')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Personnel</mat-label>
            <mat-select formControlName="personnelId">
              <mat-option *ngFor="let p of personnel" [value]="p.id">{{ p.fullName }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="date" />
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="form.get('date')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Quantity</mat-label>
            <input matInput type="number" formControlName="quantity" min="1" />
            <mat-error *ngIf="form.get('quantity')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Reason</mat-label>
            <input matInput formControlName="reason" placeholder="e.g. Heart attack" />
          </mat-form-field>

          <div class="file-upload">
            <button type="button" mat-stroked-button (click)="fileInput.click()">
              <mat-icon>attach_file</mat-icon> Attach Photo
            </button>
            <input
              #fileInput
              type="file"
              (change)="onFileSelected($event)"
              style="display: none"
              accept="image/*"
            />
            <span class="file-name" *ngIf="selectedFile">{{ selectedFile.name }}</span>
          </div>
          <mat-progress-bar *ngIf="isUploading" mode="indeterminate"></mat-progress-bar>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button
          mat-flat-button
          color="primary"
          type="submit"
          [disabled]="form.invalid || isUploading"
        >
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
        min-width: 350px;
      }
      mat-form-field {
        width: 100%;
      }
      .file-upload {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }
      .file-name {
        font-size: 0.9em;
        color: gray;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 200px;
      }
    `,
  ],
})
export class MortalityDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private houseService = inject(HousesService);
  private personnelService = inject(PersonnelService);
  private fileService = inject(FileUploadService);

  form: FormGroup;
  houses: House[] = [];
  personnel: Personnel[] = [];
  selectedFile: File | null = null;
  isUploading = false;

  constructor(public dialogRef: MatDialogRef<MortalityDialogComponent>) {
    this.form = this.fb.group({
      houseId: ['', Validators.required],
      personnelId: [''],
      date: [new Date(), Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      reason: [''],
      attachmentUrl: [''],
    });
  }

  ngOnInit(): void {
    this.houseService.getHouses().subscribe((data) => (this.houses = data));
    this.personnelService.getPersonnels().subscribe((data) => (this.personnel = data));
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      if (this.selectedFile) {
        this.isUploading = true;
        this.fileService.uploadFile(this.selectedFile).subscribe({
          next: (res) => {
            // Save full relative path "bucket/fileName"
            const fullPath = `${res.bucket}/${res.fileName}`;
            this.form.patchValue({ attachmentUrl: fullPath });
            this.isUploading = false;
            this.dialogRef.close(this.form.value);
          },
          error: () => {
            this.isUploading = false;
            alert('Failed to upload file');
          },
        });
      } else {
        this.dialogRef.close(this.form.value);
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
