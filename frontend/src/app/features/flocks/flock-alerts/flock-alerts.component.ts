import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-flock-alerts',
  standalone: true,
  imports: [CommonModule, TranslateModule, TableModule, TagModule],
  template: `
    <div class="bg-white border border-slate-200 rounded-[24px] overflow-hidden">
      <p-table
        [value]="alerts"
        styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th class="text-xs text-slate-500 font-medium bg-slate-50 border-b border-slate-100 pl-6 py-3">Severity</th>
            <th class="text-xs text-slate-500 font-medium bg-slate-50 border-b border-slate-100 py-3">Message</th>
            <th class="text-xs text-slate-500 font-medium bg-slate-50 border-b border-slate-100 py-3">Time</th>
            <th class="bg-slate-50 border-b border-slate-100"></th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          let-alert>
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="pl-6 py-3">
              <p-tag
                [severity]="alert.severity"
                [value]="alert.level"
                [rounded]="true"></p-tag>
            </td>
            <td class="text-sm text-slate-800 font-medium py-3">{{ alert.message }}</td>
            <td class="text-xs text-slate-500 py-3">{{ alert.time }}</td>
            <td class="py-3 text-right pr-4">
              <button class="text-slate-400 hover:text-blue-500"><i class="pi pi-chevron-right"></i></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td
              colspan="4"
              class="text-center py-8 text-slate-500 text-sm">
              Нет активных предупреждений
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class FlockAlertsComponent {
  alerts = [
    { severity: 'danger', level: 'Critical', message: 'NH3 level exceeded 25ppm', time: '10:45 AM' },
    { severity: 'warning', level: 'Warning', message: 'Temperature deviation (+2°C)', time: '08:30 AM' },
    { severity: 'info', level: 'Info', message: 'Feed hopper refilled', time: 'Yesterday' },
  ];
}
