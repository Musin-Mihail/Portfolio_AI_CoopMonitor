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
    <h2 mat-dialog-title>Add Feed & Water Record</h2>
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
            <mat-label>Feed Type</mat-label>
            <mat-select formControlName="feedId">
              <mat-option
                *ngFor="let f of feeds()"
                [value]="f.id">
                {{ f.name }} ({{ f.type }})
              </mat-option>
            </mat-select>
          </mat-form-field>

          <div class="row">
            <mat-form-field
              appearance="outline"
              class="half-width">
              <mat-label>Feed (kg)</mat-label>
              <input
                matInput
                type="number"
                formControlName="feedQuantityKg" />
            </mat-form-field>

            <mat-form-field
              appearance="outline"
              class="half-width">
              <mat-label>Water (L)</mat-label>
              <input
                matInput
                type="number"
                formControlName="waterQuantityLiters" />
            </mat-form-field>
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
        gap: 12px;
        min-width: 350px;
      }
      .row {
        display: flex;
        gap: 12px;
      }
      .half-width {
        flex: 1;
      }
      mat-form-field {
        width: 100%;
      }
    `,
  ],
})
export class FeedWaterDialogComponent implements OnInit {
  form: FormGroup;
  houses = signal<House[]>([]);
  personnel = signal<Personnel[]>([]);
  feeds = signal<Feed[]>([]);

  constructor(
    private fb: FormBuilder,
    private housesService: HousesService,
    private personnelService: PersonnelService,
    private feedsService: FeedsService,
    public dialogRef: MatDialogRef<FeedWaterDialogComponent>,
  ) {
    this.form = this.fb.group({
      houseId: [null, Validators.required],
      personnelId: [null],
      date: [new Date(), Validators.required],
      feedId: [null],
      feedQuantityKg: [0, [Validators.required, Validators.min(0)]],
      waterQuantityLiters: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.housesService.getHouses().subscribe((data) => this.houses.set(data));
    this.personnelService.getPersonnels().subscribe((data) => this.personnel.set(data));
    this.feedsService.getFeeds().subscribe((data) => this.feeds.set(data));
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
