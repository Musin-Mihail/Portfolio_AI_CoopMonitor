import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { House, Personnel, Feed } from '../../../core/models/master-data.models';
import { HousesService } from '../../../core/services/houses.service';
import { PersonnelService } from '../../../core/services/personnel.service';
import { FeedsService } from '../../../core/services/feeds.service';

@Component({
  selector: 'app-feed-water-dialog',
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
  ],
  template: `
    <h2 mat-dialog-title>Feed & Water Record</h2>
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <mat-form-field appearance="outline">
            <mat-label>House</mat-label>
            <mat-select formControlName="houseId">
              <mat-option
                *ngFor="let h of houses"
                [value]="h.id">
                {{ h.name }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('houseId')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Personnel</mat-label>
            <mat-select formControlName="personnelId">
              <mat-option
                *ngFor="let p of personnel"
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
            <mat-label>Feed Type</mat-label>
            <mat-select formControlName="feedId">
              <mat-option
                *ngFor="let f of feeds"
                [value]="f.id">
                {{ f.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Feed Quantity (kg)</mat-label>
            <input
              matInput
              type="number"
              formControlName="feedQuantityKg"
              min="0" />
            <mat-error *ngIf="form.get('feedQuantityKg')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Water Quantity (L)</mat-label>
            <input
              matInput
              type="number"
              formControlName="waterQuantityLiters"
              min="0" />
            <mat-error *ngIf="form.get('waterQuantityLiters')?.hasError('required')">Required</mat-error>
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
        min-width: 350px;
      }
      mat-form-field {
        width: 100%;
      }
    `,
  ],
})
export class FeedWaterDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private houseService = inject(HousesService);
  private personnelService = inject(PersonnelService);
  private feedService = inject(FeedsService);

  form: FormGroup;
  houses: House[] = [];
  personnel: Personnel[] = [];
  feeds: Feed[] = [];

  constructor(public dialogRef: MatDialogRef<FeedWaterDialogComponent>) {
    this.form = this.fb.group({
      houseId: ['', Validators.required],
      personnelId: [''],
      date: [new Date(), Validators.required],
      feedId: [''],
      feedQuantityKg: [0, Validators.required],
      waterQuantityLiters: [0, Validators.required],
    });
  }

  ngOnInit(): void {
    this.houseService.getHouses().subscribe((data) => (this.houses = data));
    this.personnelService.getPersonnels().subscribe((data) => (this.personnel = data));
    this.feedService.getFeeds().subscribe((data) => (this.feeds = data));
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
