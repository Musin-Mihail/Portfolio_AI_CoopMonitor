import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { HousesService } from '../../../../core/services/houses.service';
import { LogFilterService } from '../../services/log-filter.service';
import { House } from '../../../../core/models/master-data.models';

@Component({
  selector: 'app-logs-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, DatePickerModule, TranslateModule],
  templateUrl: './logs-filter.component.html',
  styleUrl: './logs-filter.component.scss',
})
export class LogsFilterComponent implements OnInit {
  private housesService = inject(HousesService);
  private filterService = inject(LogFilterService);

  houses = signal<House[]>([]);

  selectedHouseId: number | null = null;
  selectedRange: Date[] | null = null;
  selectedStatus: string | null = null;

  statusOptions = [
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' },
  ];

  ngOnInit() {
    this.loadHouses();

    // Restore state from service
    this.selectedHouseId = this.filterService.houseId();
    if (this.filterService.startDate()) {
      this.selectedRange = [this.filterService.startDate()!];
      if (this.filterService.endDate()) {
        this.selectedRange.push(this.filterService.endDate()!);
      }
    }
  }

  loadHouses() {
    this.housesService.getHouses().subscribe((data) => this.houses.set(data));
  }

  apply() {
    this.filterService.updateFilters(this.selectedHouseId, this.selectedRange, this.selectedStatus);
  }

  reset() {
    this.selectedHouseId = null;
    this.selectedRange = null;
    this.selectedStatus = null;
    this.filterService.resetFilters();
  }
}
