import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { TranslateModule } from '@ngx-translate/core';
import { Camera } from '../../../core/models/camera.models';
import { HousesService } from '../../../core/services/houses.service';
import { House } from '../../../core/models/master-data.models';

@Component({
  selector: 'app-camera-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
    PasswordModule,
    TranslateModule,
  ],
  templateUrl: './camera-dialog.component.html',
  styleUrl: './camera-dialog.component.scss',
})
export class CameraDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private housesService = inject(HousesService);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  form: FormGroup;
  houses = signal<House[]>([]);
  data: Camera | null = null;
  title: string = '';

  types = [
    { label: 'RGB', value: 'RGB' },
    { label: 'Thermal', value: 'Thermal' },
  ];

  constructor() {
    this.data = this.config.data;
    this.title = this.data ? 'MD_CAMERAS.DIALOG_TITLE_EDIT' : 'MD_CAMERAS.DIALOG_TITLE_ADD';

    this.form = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      type: [this.data?.type || 'RGB', Validators.required],
      houseId: [this.data?.houseId || null],
      ipAddress: [this.data?.ipAddress || '', Validators.required],
      port: [this.data?.port || 554, Validators.required],
      username: [this.data?.username || ''],
      password: [''],
      streamPath: [this.data?.streamPath || ''],
      position: [this.data?.position || 0],
      isActive: [this.data?.isActive ?? true],
    });
  }

  ngOnInit() {
    this.housesService.getHouses().subscribe((data) => this.houses.set(data));
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.ref.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.ref.close();
  }
}
