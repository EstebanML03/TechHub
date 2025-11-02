import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { FilterOptions } from '../../services/filter.service';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './filters.html',
  styleUrl: './filters.css'
})
export class FiltersComponent implements OnInit {
  @Input() categories: string[] = [];
  @Input() showSearch: boolean = true;
  @Input() showCategoryFilter: boolean = true;
  @Input() showSortOptions: boolean = true;

  @Output() filterChange = new EventEmitter<FilterOptions>();

  searchTerm: string = '';
  selectedCategory: string = 'todas';
  selectedSort: 'recent' | 'popular' | 'oldest' | 'title' = 'recent';

  sortOptions = [
    { value: 'recent', label: 'Más recientes', icon: 'clock' },
    { value: 'popular', label: 'Más populares', icon: 'trending-up' },
    { value: 'oldest', label: 'Más antiguos', icon: 'archive' },
    { value: 'title', label: 'Alfabético', icon: 'sort-asc' }
  ];

  showMobileFilters = false;

  ngOnInit(): void {
    this.emitFilters();
  }

  onSearchChange(): void {
    this.emitFilters();
  }

  onCategoryChange(): void {
    this.emitFilters();
  }

  onSortChange(): void {
    this.emitFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'todas';
    this.selectedSort = 'recent';
    this.emitFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm !== '' || this.selectedCategory !== 'todas' || this.selectedSort !== 'recent';
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
  }

  private emitFilters(): void {
    const filters: FilterOptions = {
      searchTerm: this.searchTerm,
      category: this.selectedCategory,
      sortBy: this.selectedSort
    };

    this.filterChange.emit(filters);
  }
}
