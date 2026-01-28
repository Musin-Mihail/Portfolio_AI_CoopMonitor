import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, PasswordModule, SelectModule],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
      class="flex flex-col gap-5 pt-2">
      <div class="flex flex-col gap-2">
        <label
          for="userName"
          class="font-medium">
          Username
        </label>
        <input
          pInputText
          id="userName"
          formControlName="userName"
          class="w-full" />
        <small
          class="text-red-500"
          *ngIf="form.get('userName')?.hasError('required') && form.get('userName')?.touched">
          Username is required
        </small>
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="email"
          class="font-medium">
          Email
        </label>
        <input
          pInputText
          type="email"
          id="email"
          formControlName="email"
          class="w-full" />
        <small
          class="text-red-500"
          *ngIf="form.get('email')?.hasError('email') && form.get('email')?.touched">
          Invalid email
        </small>
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="password"
          class="font-medium">
          Password
        </label>
        <p-password
          id="password"
          formControlName="password"
          [feedback]="true"
          [toggleMask]="true"
          styleClass="w-full"
          inputStyleClass="w-full" />
        <small
          class="text-red-500"
          *ngIf="form.get('password')?.hasError('required') && form.get('password')?.touched">
          Password is required
        </small>
        <small
          class="text-red-500"
          *ngIf="form.get('password')?.hasError('minlength') && form.get('password')?.touched">
          Minimum 4 characters
        </small>
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="role"
          class="font-medium">
          Role
        </label>
        <p-select
          id="role"
          formControlName="role"
          [options]="roles"
          styleClass="w-full" />
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <p-button
          label="Cancel"
          severity="secondary"
          [text]="true"
          (onClick)="onCancel()" />
        <p-button
          label="Create"
          type="submit"
          [disabled]="form.invalid" />
      </div>
    </form>
  `,
})
export class UserDialogComponent {
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);

  form: FormGroup;
  roles = ['Admin', 'User', 'Viewer'];

  constructor() {
    this.form = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      role: ['User', Validators.required],
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
