import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { Feed } from '../../../core/models/master-data.models';

@Component({
  selector: 'app-feed-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, TextareaModule, SelectModule],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
      class="flex flex-col gap-6 pt-2">
      <div class="flex flex-col gap-2">
        <label
          for="name"
          class="font-medium">
          Feed Name
        </label>
        <input
          pInputText
          id="name"
          formControlName="name"
          class="w-full"
          [class.ng-invalid]="form.get('name')?.invalid && form.get('name')?.touched" />
        <small
          class="text-red-500"
          *ngIf="form.get('name')?.hasError('required') && form.get('name')?.touched">
          Name is required
        </small>
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="type"
          class="font-medium">
          Type
        </label>
        <p-select
          id="type"
          formControlName="type"
          [options]="types"
          placeholder="Select a type"
          styleClass="w-full" />
        <small
          class="text-red-500"
          *ngIf="form.get('type')?.hasError('required') && form.get('type')?.touched">
          Type is required
        </small>
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="description"
          class="font-medium">
          Description
        </label>
        <textarea
          pTextarea
          id="description"
          formControlName="description"
          rows="3"
          class="w-full"></textarea>
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
          [disabled]="form.invalid" />
      </div>
    </form>
  `,
})
export class FeedDialogComponent {
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  form: FormGroup;
  data: Feed | null = null;
  types = ['Starter', 'Grower', 'Finisher', 'Supplement'];

  constructor() {
    this.data = this.config.data;

    this.form = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      type: [this.data?.type || '', Validators.required],
      description: [this.data?.description || ''],
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
