import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { HousesService } from '../../../core/services/houses.service';
import { PersonnelService } from '../../../core/services/personnel.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-marking-dialog',
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
    <h2 mat-dialog-title>New Marking Record</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <div class="row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>House</mat-label>
              <mat-select formControlName="houseId">
                <mat-option *ngFor="let h of houses()" [value]="h.id">
                  {{ h.name }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="form.get('houseId')?.hasError('required')">Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Responsible</mat-label>
              <mat-select formControlName="personnelId">
                <mat-option *ngFor="let p of personnel()" [value]="p.id">
                  {{ p.fullName }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="date" />
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Bird Age (Days)</mat-label>
              <input matInput type="number" formControlName="birdAgeDays" (input)="onAgeChange()" />
              <mat-error *ngIf="form.get('birdAgeDays')?.hasError('required')">Required</mat-error>
            </mat-form-field>
          </div>

          <div class="info-box">
            <mat-icon>info</mat-icon>
            <span
              >Protocol for age <strong>{{ age() }}</strong> days:
              <strong>{{ isOlder() ? 'Tape + Number' : 'Paint + Ring' }}</strong>
            </span>
          </div>

          <div *ngIf="!isOlder()" class="protocol-section">
            <h3>Paint & Ring Protocol</h3>
            <div class="row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Paint Color</mat-label>
                <input matInput formControlName="color" placeholder="e.g. Red Strip" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Ring Number</mat-label>
                <input matInput formControlName="ringNumber" placeholder="Optional" />
              </mat-form-field>
            </div>
          </div>

          <div *ngIf="isOlder()" class="protocol-section">
            <h3>Tape & Number Protocol</h3>
            <div class="row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Tape Color</mat-label>
                <input matInput formControlName="color" placeholder="e.g. Blue Tape" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Painted Number</mat-label>
                <input matInput formControlName="ringNumber" placeholder="Big digits on back" />
              </mat-form-field>
            </div>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Bird Identifier (Optional)</mat-label>
            <input matInput formControlName="birdIdentifier" placeholder="Internal ID if any" />
          </mat-form-field>

          <div class="file-upload">
            <label>Photo Evidence (Recommended)</label>
            <div class="file-input-wrapper">
              <button type="button" mat-stroked-button (click)="fileInput.click()">
                <mat-icon>camera_alt</mat-icon> Select Photo
              </button>
              <span class="file-name">{{ selectedFile?.name || 'No file selected' }}</span>
              <input
                #fileInput
                type="file"
                accept="image/*"
                (change)="onFileSelected($event)"
                style="display: none;"
              />
            </div>
          </div>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
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
        min-width: 450px;
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
      .info-box {
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: #e3f2fd;
        padding: 10px;
        border-radius: 4px;
        color: #0d47a1;
        mat-icon {
          font-size: 20px;
          height: 20px;
          width: 20px;
        }
      }
      .protocol-section {
        border: 1px dashed #ccc;
        padding: 10px;
        border-radius: 4px;
        h3 {
          margin-top: 0;
          font-size: 1rem;
          color: #555;
        }
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
    `,
  ],
})
export class MarkingDialogComponent {
  private fb = inject(FormBuilder);
  private housesService = inject(HousesService);
  private personnelService = inject(PersonnelService);
  public dialogRef = inject(MatDialogRef<MarkingDialogComponent>);

  houses = toSignal(this.housesService.getHouses());
  personnel = toSignal(this.personnelService.getPersonnels());

  selectedFile: File | null = null;
  age = signal<number>(0);
  isOlder = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    houseId: ['', Validators.required],
    personnelId: [null],
    date: [new Date(), Validators.required],
    birdAgeDays: [0, [Validators.required, Validators.min(0)]],
    birdIdentifier: [''],
    color: [''],
    ringNumber: [''],
  });

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
      // Determine marking type based on age
      const markingType = this.isOlder() ? 'TapeNumber' : 'PaintRing';

      const result = {
        ...this.form.value,
        markingType: markingType,
        photoFile: this.selectedFile,
        date: this.form.value.date.toISOString(),
      };
      this.dialogRef.close(result);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
