import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-flock-predict',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div
      class="flex flex-col gap-6 h-full justify-center items-center text-center p-10"
      *ngIf="true; else risksTemplate">
      <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4">
        <i class="pi pi-check-circle text-5xl text-green-500"></i>
      </div>
      <h3 class="text-xl font-bold text-slate-800">{{ 'FLOCKS.PREDICT.NO_RISKS_TITLE' | translate }}</h3>
      <p class="text-slate-500 max-w-md">
        {{ 'FLOCKS.PREDICT.NO_RISKS_DESC' | translate }}
      </p>
      <div class="flex gap-4 mt-4">
        <div class="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm">
          {{ 'FLOCKS.PREDICT.RISK_COCCIDIOSIS' | translate }}
          <span class="text-green-600 font-bold">{{ 'FLOCKS.PREDICT.LOW' | translate }} (2%)</span>
        </div>
        <div class="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm">
          {{ 'FLOCKS.PREDICT.RISK_ASCITES' | translate }}
          <span class="text-green-600 font-bold">{{ 'FLOCKS.PREDICT.LOW' | translate }} (0.5%)</span>
        </div>
      </div>
    </div>

    <ng-template #risksTemplate>
      <div class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-4">
        <h3 class="text-red-700 font-bold mb-2">{{ 'FLOCKS.PREDICT.RISK_DETECTED_RESP' | translate }}</h3>
        <p class="text-red-600 text-sm">{{ 'FLOCKS.PREDICT.RISK_DETECTED_DESC' | translate }}</p>
      </div>
    </ng-template>
  `,
})
export class FlockPredictComponent {}
