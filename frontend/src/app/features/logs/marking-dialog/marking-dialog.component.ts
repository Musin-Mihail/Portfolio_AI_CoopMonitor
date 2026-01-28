import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { House, Personnel } from '../../../core/models/master-data.models';
import { HousesService } from '../../../core/services/houses.service';
import { PersonnelService } from '../../../core/services/personnel.service';

@Component({
  selector: 'app-marking-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, DatePickerModule],
  templateUrl: './marking-dialog.component.html',
  styleUrl: './marking-dialog.component.scss',
})
export class MarkingDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private housesService = inject(HousesService);
  private personnelService = inject(PersonnelService);
  public ref = inject(DynamicDialogRef);

  form: FormGroup;
  houses = signal<House[]>([]);
  personnel = signal<Personnel[]>([]);
  selectedFile: File | null = null;
  age = signal<number>(0);
  isOlder = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      houseId: [null, Validators.required],
      personnelId: [null],
      date: [new Date(), Validators.required],
      birdAgeDays: [0, [Validators.required, Validators.min(0)]],
      birdIdentifier: [''],
      color: [''],
      ringNumber: [''],
    });
  }

  ngOnInit() {
    this.housesService.getHouses().subscribe((data) => this.houses.set(data));
    this.personnelService.getPersonnels().subscribe((data) => this.personnel.set(data));
  }

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
      const markingType = this.isOlder() ? 'TapeNumber' : 'PaintRing';

      const result = {
        ...this.form.value,
        markingType: markingType,
        photoFile: this.selectedFile,
        // Ensure date is ISO
        date: this.form.value.date instanceof Date ? this.form.value.date.toISOString() : this.form.value.date,
      };
      this.ref.close(result);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel() {
    this.ref.close();
  }
}
