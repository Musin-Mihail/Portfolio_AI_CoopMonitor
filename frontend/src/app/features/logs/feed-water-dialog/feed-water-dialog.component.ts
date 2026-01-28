import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { House, Personnel, Feed } from '../../../core/models/master-data.models';
import { FeedWaterRecord } from '../../../core/models/logs.models';
import { HousesService } from '../../../core/services/houses.service';
import { PersonnelService } from '../../../core/services/personnel.service';
import { FeedsService } from '../../../core/services/feeds.service';

@Component({
  selector: 'app-feed-water-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, DatePickerModule],
  templateUrl: './feed-water-dialog.component.html',
  styleUrl: './feed-water-dialog.component.scss',
})
export class FeedWaterDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private housesService = inject(HousesService);
  private personnelService = inject(PersonnelService);
  private feedsService = inject(FeedsService);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  form: FormGroup;
  houses = signal<House[]>([]);
  personnel = signal<Personnel[]>([]);
  feeds = signal<Feed[]>([]);
  data: FeedWaterRecord | null = null;

  constructor() {
    this.data = this.config.data;

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

    if (this.data) {
      this.form.patchValue({
        houseId: this.data.houseId,
        personnelId: this.data.personnelId,
        date: new Date(this.data.date),
        feedId: this.data.feedId,
        feedQuantityKg: this.data.feedQuantityKg,
        waterQuantityLiters: this.data.waterQuantityLiters,
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      formValue.date = formValue.date instanceof Date ? formValue.date.toISOString() : formValue.date;
      this.ref.close(formValue);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel() {
    this.ref.close();
  }
}
