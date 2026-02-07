import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-flock-alerts',
  standalone: true,
  imports: [CommonModule, TranslateModule, TableModule, TagModule],
  templateUrl: './flock-alerts.component.html',
  styleUrl: './flock-alerts.component.scss',
})
export class FlockAlertsComponent {
  alerts = [
    { severity: 'danger', level: 'Critical', message: 'NH3 level exceeded 25ppm', time: '10:45 AM' },
    { severity: 'warning', level: 'Warning', message: 'Temperature deviation (+2°C)', time: '08:30 AM' },
    { severity: 'info', level: 'Info', message: 'Feed hopper refilled', time: 'Yesterday' },
  ];
}
