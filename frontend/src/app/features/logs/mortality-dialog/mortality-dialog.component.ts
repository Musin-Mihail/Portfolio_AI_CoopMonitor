import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUploadModule } from 'primeng/fileupload';
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
    InputTextModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    FileUploadModule,
  ],
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
        <small
          class="text-red-500"
          *ngIf="form.get('date')?.hasError('required') && form.get('date')?.touched">
          Date is required
        </small>
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="quantity"
          class="font-medium">
          Quantity
        </label>
        <input
          pInputText
          id="quantity"
          type="number"
          formControlName="quantity"
          class="w-full" />
        <small
          class="text-red-500"
          *ngIf="form.get('quantity')?.hasError('required') && form.get('quantity')?.touched">
          Quantity is required
        </small>
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="reason"
          class="font-medium">
          Reason
        </label>
        <input
          pInputText
          id="reason"
          formControlName="reason"
          placeholder="e.g. Heart failure"
          class="w-full" />
      </div>

      <div class="flex flex-col gap-2">
        <label class="font-medium">Attachment (Photo)</label>
        <div class="flex items-center gap-3 border border-slate-200 p-3 rounded bg-slate-50">
          <button
            pButton
            type="button"
            icon="pi pi-paperclip"
            label="Select Photo"
            class="p-button-outlined p-button-secondary p-button-sm"
            (click)="fileInput.click()"></button>
          <span class="text-sm text-slate-600 truncate max-w-[200px]">
            {{ selectedFile?.name || 'No file selected' }}
          </span>
          <input
            #fileInput
            type="file"
            (change)="onFileSelected($event)"
            style="display: none"
            accept="image/*" />
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
          [loading]="isUploading()"
          [disabled]="form.invalid" />
      </div>
    </form>
  `,
})
export class MortalityDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private housesService = inject(HousesService);
  private personnelService = inject(PersonnelService);
  private fileUploadService = inject(FileUploadService);
  public ref = inject(DynamicDialogRef);

  form: FormGroup;
  houses = signal<House[]>([]);
  personnel = signal<Personnel[]>([]);
  selectedFile: File | null = null;
  isUploading = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      houseId: [null, Validators.required],
      personnelId: [null],
      date: [new Date(), Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]],
      reason: [''],
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isUploading.set(true);
    const formValue = this.form.value;

    if (this.selectedFile) {
      this.fileUploadService.uploadFile(this.selectedFile, 'user-uploads').subscribe({
        next: (response) => {
          const dto = {
            ...formValue,
            attachmentUrl: `${response.bucket}/${response.fileName}`,
          };
          this.ref.close(dto);
        },
        error: () => {
          this.isUploading.set(false);
          // Error handling is done by parent or toast, but we can't show toast here easily without inject
          // Usually better to let parent handle error or inject MessageService
          console.error('Upload failed');
        },
      });
    } else {
      this.ref.close(formValue);
    }
  }

  onCancel() {
    this.ref.close();
  }
}
