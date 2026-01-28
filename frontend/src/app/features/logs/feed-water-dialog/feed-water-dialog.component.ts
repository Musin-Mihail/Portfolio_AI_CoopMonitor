import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { House, Personnel, Feed } from '../../../core/models/master-data.models';
import { HousesService } from '../../../core/services/houses.service';
import { PersonnelService } from '../../../core/services/personnel.service';
import { FeedsService } from '../../../core/services/feeds.service';

@Component({
  selector: 'app-feed-water-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, DatePickerModule],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
      class="flex flex-col gap-5 pt-2">
      <div class="flex flex-col gap-2">
        <label
          for="houseId"
          class="font-medium">
          House
        </label>
        <p-select
          id="houseId"
          formControlName="houseId"
          [options]="houses()"
          optionLabel="name"
          optionValue="id"
          placeholder="Select a House"
          styleClass="w-full" />
        <small
          class="text-red-500"
          *ngIf="form.get('houseId')?.hasError('required') && form.get('houseId')?.touched">
          House is required
        </small>
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="personnelId"
          class="font-medium">
          Responsible Person
        </label>
        <p-select
          id="personnelId"
          formControlName="personnelId"
          [options]="personnel()"
          optionLabel="fullName"
          optionValue="id"
          placeholder="Select Responsible"
          styleClass="w-full" />
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="date"
          class="font-medium">
          Date
        </label>
        <p-datepicker
          id="date"
          formControlName="date"
          dateFormat="yy-mm-dd"
          appendTo="body"
          styleClass="w-full"
          [showIcon]="true" />
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="feedId"
          class="font-medium">
          Feed Type
        </label>
        <p-select
          id="feedId"
          formControlName="feedId"
          [options]="feeds()"
          optionLabel="name"
          optionValue="id"
          placeholder="Select Feed"
          styleClass="w-full" />
      </div>

      <div class="flex gap-4">
        <div class="flex-1 flex flex-col gap-2">
          <label
            for="feedQuantityKg"
            class="font-medium">
            Feed (kg)
          </label>
          <input
            pInputText
            id="feedQuantityKg"
            type="number"
            formControlName="feedQuantityKg"
            class="w-full" />
          <small
            class="text-red-500"
            *ngIf="form.get('feedQuantityKg')?.hasError('required') && form.get('feedQuantityKg')?.touched">
            Required
          </small>
        </div>

        <div class="flex-1 flex flex-col gap-2">
          <label
            for="waterQuantityLiters"
            class="font-medium">
            Water (L)
          </label>
          <input
            pInputText
            id="waterQuantityLiters"
            type="number"
            formControlName="waterQuantityLiters"
            class="w-full" />
          <small
            class="text-red-500"
            *ngIf="form.get('waterQuantityLiters')?.hasError('required') && form.get('waterQuantityLiters')?.touched">
            Required
          </small>
        </div>
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
export class FeedWaterDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private housesService = inject(HousesService);
  private personnelService = inject(PersonnelService);
  private feedsService = inject(FeedsService);
  public ref = inject(DynamicDialogRef);

  form: FormGroup;
  houses = signal<House[]>([]);
  personnel = signal<Personnel[]>([]);
  feeds = signal<Feed[]>([]);

  constructor() {
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
      this.ref.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel() {
    this.ref.close();
  }
}
