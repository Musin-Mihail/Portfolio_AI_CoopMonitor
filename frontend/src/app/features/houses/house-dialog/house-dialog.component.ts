import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslateModule } from '@ngx-translate/core';
import { House } from '../../../core/models/master-data.models';

@Component({
  selector: 'app-house-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, InputNumberModule, TranslateModule],
  templateUrl: './house-dialog.component.html',
  styleUrl: './house-dialog.component.scss',
})
export class HouseDialogComponent {
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  form: FormGroup;
  data: House | null = null;
  title: string = '';

  constructor() {
    this.data = this.config.data;
    // Use Translation Keys
    this.title = this.data ? 'MD_HOUSES.DIALOG_TITLE_EDIT' : 'MD_HOUSES.DIALOG_TITLE_ADD';

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
