import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { UserDto } from '../../../core/models/admin.models';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, PasswordModule, SelectModule],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.scss',
})
export class UserDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  form: FormGroup;
  roles = ['Admin', 'User', 'Viewer'];
  data: UserDto | null = null;
  title: string = '';

  constructor() {
    this.data = this.config.data;
    this.title = this.data ? 'Edit User' : 'Create User';

    // If editing (data exists), password is not required.
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
      // Remove empty password if editing
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
