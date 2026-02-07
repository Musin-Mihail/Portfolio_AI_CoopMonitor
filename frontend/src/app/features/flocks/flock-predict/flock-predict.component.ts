import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-flock-predict',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './flock-predict.component.html',
  styleUrl: './flock-predict.component.scss',
})
export class FlockPredictComponent {}
