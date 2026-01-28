import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { House } from '../../../core/models/master-data.models';

@Component({
  selector: 'app-house-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './house-dialog.component.html',
  styleUrl: './house-dialog.component.scss',
})
export class HouseDialogComponent {
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  form: FormGroup;
  data: House | null = null;

  constructor() {
    this.data = this.config.data;

    this.form = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      area: [this.data?.area || 0, [Validators.required, Validators.min(1)]],
      capacity: [this.data?.capacity || 0, [Validators.required, Validators.min(1)]],
      configurationJson: [this.data?.configurationJson || null],
    });
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
