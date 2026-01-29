import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TranslateModule } from '@ngx-translate/core';
import { Personnel } from '../../../core/models/master-data.models';

@Component({
  selector: 'app-personnel-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToggleSwitchModule, TranslateModule],
  templateUrl: './personnel-dialog.component.html',
  styleUrl: './personnel-dialog.component.scss',
})
export class PersonnelDialogComponent {
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  form: FormGroup;
  data: Personnel | null = null;
  title: string = '';

  constructor() {
    this.data = this.config.data;
    this.title = this.data ? 'MD_PERSONNEL.DIALOG_TITLE_EDIT' : 'MD_PERSONNEL.DIALOG_TITLE_ADD';

    this.form = this.fb.group({
      fullName: [this.data?.fullName || '', Validators.required],
      jobTitle: [this.data?.jobTitle || ''],
      phoneNumber: [this.data?.phoneNumber || ''],
      email: [this.data?.email || '', [Validators.email]],
      isActive: [this.data?.isActive ?? true],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.ref.close(this.form.value);
    }
  }

  onCancel(): void {
    this.ref.close();
  }
}
