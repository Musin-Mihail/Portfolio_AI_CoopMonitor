import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { HousesService } from '../../../core/services/houses.service';
import { House } from '../../../core/models/master-data.models';

@Component({
  selector: 'app-house-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './house-list.component.html',
})
export class HouseListComponent implements OnInit {
  private service = inject(HousesService);
  dataSource = signal<House[]>([]);

  ngOnInit(): void {
    this.load();
  }
  load() {
    this.service.getHouses().subscribe((data) => this.dataSource.set(data));
  }
}
