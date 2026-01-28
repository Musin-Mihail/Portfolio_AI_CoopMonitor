import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { UserDto } from '../../../core/models/admin.models';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    SelectModule,
    TranslateModule,
  ],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.scss',
})
export class UserDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  form: FormGroup;
  // Use translation keys for labels, but keep backend values (Admin, User, Viewer)
  roles = [
    { label: 'ADMIN_USERS.ROLES.ADMIN', value: 'Admin' },
    { label: 'ADMIN_USERS.ROLES.USER', value: 'User' },
    { label: 'ADMIN_USERS.ROLES.VIEWER', value: 'Viewer' },
  ];
  data: UserDto | null = null;
  title: string = '';

  constructor() {
    this.data = this.config.data;
    this.title = this.data ? 'ADMIN_USERS.DIALOG_TITLE_EDIT' : 'ADMIN_USERS.DIALOG_TITLE_ADD';

    const passwordValidators = this.data ? [Validators.minLength(4)] : [Validators.required, Validators.minLength(4)];

    this.form = this.fb.group({
      userName: [this.data?.userName || '', Validators.required],
      email: [this.data?.email || '', [Validators.required, Validators.email]],
      password: ['', passwordValidators],
      role: [this.data?.role || 'User', Validators.required],
    });
  }

  ngOnInit() {
    // Additional logic if needed
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      if (this.data && !formValue.password) {
        delete formValue.password;
      }
      this.ref.close(formValue);
    }
  }

  onCancel(): void {
    this.ref.close();
  }
}
