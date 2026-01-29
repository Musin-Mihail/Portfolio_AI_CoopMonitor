import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LogFilterService {
  houseId = signal<number | null>(null);
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  status = signal<string | null>(null);

  updateFilters(houseId: number | null, range: Date[] | null, status: string | null = null) {
    this.houseId.set(houseId);

    if (range && range.length > 0) {
      this.startDate.set(range[0]);
      this.endDate.set(range[1] || range[0]); // Handle single date selection
    } else {
      this.startDate.set(null);
      this.endDate.set(null);
    }

    this.status.set(status);
  }

  resetFilters() {
    this.houseId.set(null);
    this.startDate.set(null);
    this.endDate.set(null);
    this.status.set(null);
  }
}
