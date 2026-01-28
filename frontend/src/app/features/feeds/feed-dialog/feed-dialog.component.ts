import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { Feed } from '../../../core/models/master-data.models';

@Component({
  selector: 'app-feed-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    TextareaModule,
    SelectModule,
    TranslateModule,
  ],
  templateUrl: './feed-dialog.component.html',
  styleUrl: './feed-dialog.component.scss',
})
export class FeedDialogComponent {
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  form: FormGroup;
  data: Feed | null = null;
  types = ['Starter', 'Grower', 'Finisher', 'Supplement'];
  title: string = '';

  constructor() {
    this.data = this.config.data;
    this.title = this.data ? 'MD_FEEDS.DIALOG_TITLE_EDIT' : 'MD_FEEDS.DIALOG_TITLE_ADD';

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
