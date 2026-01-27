import { Component, Inject, OnInit, signal } from '@angular/core';
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
import { House, Personnel } from '../../../core/models/master-data.models';
import { HousesService } from '../../../core/services/houses.service';
import { PersonnelService } from '../../../core/services/personnel.service';
import { FileUploadService } from '../../../core/services/file-upload.service';

@Component({
  selector: 'app-disease-dialog',
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
  ],
  template: `
    <h2 mat-dialog-title>Add Disease/Treatment Record</h2>
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <mat-form-field appearance="outline">
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

          <mat-form-field appearance="outline">
            <mat-label>Responsible</mat-label>
            <mat-select formControlName="personnelId">
              <mat-option
                *ngFor="let p of personnel()"
                [value]="p.id">
                {{ p.fullName }}
              </mat-option>
            </mat-select>
          </mat-form-field>

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
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Diagnosis</mat-label>
            <input
              matInput
              formControlName="diagnosis"
              placeholder="e.g. Coccidiosis" />
            <mat-error *ngIf="form.get('diagnosis')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Medicine</mat-label>
            <input
              matInput
              formControlName="medicine" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Dosage</mat-label>
            <input
              matInput
              formControlName="dosage" />
          </mat-form-field>

          <div class="file-upload">
            <button
              type="button"
              mat-stroked-button
              (click)="fileInput.click()">
              <mat-icon>attach_file</mat-icon>
              {{ selectedFile ? selectedFile.name : 'Attach Photo' }}
            </button>
            <input
              #fileInput
              type="file"
              (change)="onFileSelected($event)"
              style="display: none"
              accept="image/*" />
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
          [disabled]="form.invalid || isUploading">
          {{ isUploading ? 'Uploading...' : 'Save' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 350px;
      }
      mat-form-field {
        width: 100%;
      }
      .file-upload {
        margin-top: 8px;
      }
    `,
  ],
})
export class DiseaseDialogComponent implements OnInit {
  form: FormGroup;
  houses = signal<House[]>([]);
  personnel = signal<Personnel[]>([]);
  selectedFile: File | null = null;
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private housesService: HousesService,
    private personnelService: PersonnelService,
    private fileUploadService: FileUploadService,
    public dialogRef: MatDialogRef<DiseaseDialogComponent>,
  ) {
    this.form = this.fb.group({
      houseId: [null, Validators.required],
      personnelId: [null],
      date: [new Date(), Validators.required],
      diagnosis: ['', Validators.required],
      medicine: [''],
      dosage: [''],
    });
  }

  ngOnInit() {
    this.housesService.getHouses().subscribe((data) => this.houses.set(data));
    this.personnelService.getPersonnels().subscribe((data) => this.personnel.set(data));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isUploading = true;
    const formValue = this.form.value;

    if (this.selectedFile) {
      this.fileUploadService.uploadFile(this.selectedFile, 'user-uploads').subscribe({
        next: (response) => {
          const dto = { ...formValue, attachmentUrl: `${response.bucket}/${response.fileName}` };
          this.dialogRef.close(dto);
        },
        error: () => {
          this.isUploading = false;
          alert('Failed to upload image');
        },
      });
    } else {
      this.dialogRef.close(formValue);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
