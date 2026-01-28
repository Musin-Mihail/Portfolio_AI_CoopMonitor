import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { filter } from 'rxjs';

@Component({
  selector: 'app-master-data-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SelectModule, FormsModule],
  templateUrl: './master-data-layout.component.html',
})
export class MasterDataLayoutComponent implements OnInit {
  private router = inject(Router);

  selectedOption = signal<string>('');

  masterDataOptions = [
    { label: 'Птичники', value: '/master-data/houses' },
    { label: 'Персонал', value: '/master-data/personnel' },
    { label: 'Корма', value: '/master-data/feeds' },
  ];

  ngOnInit() {
    this.updateSelection();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => this.updateSelection());
  }

  private updateSelection() {
    const currentUrl = this.router.url;
    const activeOption = this.masterDataOptions.find((opt) => currentUrl.includes(opt.value));
    if (activeOption) {
      this.selectedOption.set(activeOption.value);
    }
  }

  onOptionChange(event: any) {
    this.router.navigate([event.value]);
  }
}
