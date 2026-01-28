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
import { FileUploadService } from '../../../core/services/file-upload.service';

@Component({
  selector: 'app-disease-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, DatePickerModule],
  templateUrl: './disease-dialog.component.html',
  styleUrl: './disease-dialog.component.scss',
})
export class DiseaseDialogComponent implements OnInit {
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
