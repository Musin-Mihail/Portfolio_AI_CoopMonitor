import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { HousesService } from '../../../core/services/houses.service';
import { House } from '../../../core/models/master-data.models';

@Component({
  selector: 'app-house-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, SelectModule, FormsModule],
  templateUrl: './house-list.component.html',
})
export class HouseListComponent implements OnInit {
  private service = inject(HousesService);
  private router = inject(Router);

  dataSource = signal<House[]>([]);
  masterDataOptions = [
    { label: 'Птичники', value: '/master-data/houses' },
    { label: 'Персонал', value: '/master-data/personnel' },
    { label: 'Корма', value: '/master-data/feeds' },
  ];
  selectedOption = '/master-data/houses';

  ngOnInit(): void {
    this.load();
  }
  onOptionChange(e: any) {
    this.router.navigate([e.value]);
  }
  load() {
    this.service.getHouses().subscribe((data) => this.dataSource.set(data));
  }
}
