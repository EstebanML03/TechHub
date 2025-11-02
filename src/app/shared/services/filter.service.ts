import { Injectable } from '@angular/core';

export interface FilterOptions {
  searchTerm?: string;
  category?: string;
  sortBy?: 'recent' | 'popular' | 'oldest' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  itemsPerPage: number;
}

export interface FilterResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  constructor() {}

  /**
   * Filtra y ordena items basándose en las opciones proporcionadas
   */
  filterAndSort<T extends Record<string, any>>(
    items: T[],
    filterOptions: FilterOptions = {},
    paginationOptions: PaginationOptions = { page: 1, itemsPerPage: 10 }
  ): FilterResult<T> {
    let filteredItems = [...items];

    // Aplicar búsqueda por término
    if (filterOptions.searchTerm) {
      const term = filterOptions.searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        this.matchesSearchTerm(item, term)
      );
    }

    // Aplicar filtro por categoría
    if (filterOptions.category && filterOptions.category !== 'todas') {
      filteredItems = filteredItems.filter(item =>
        this.matchesCategory(item, filterOptions.category!)
      );
    }

    // Aplicar ordenamiento
    if (filterOptions.sortBy) {
      filteredItems = this.sortItems(
        filteredItems,
        filterOptions.sortBy,
        filterOptions.sortOrder || 'desc'
      );
    }

    // Calcular paginación
    const total = filteredItems.length;
    const totalPages = Math.ceil(total / paginationOptions.itemsPerPage);
    const startIndex = (paginationOptions.page - 1) * paginationOptions.itemsPerPage;
    const endIndex = startIndex + paginationOptions.itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      total,
      page: paginationOptions.page,
      totalPages
    };
  }

  private matchesSearchTerm(item: Record<string, any>, term: string): boolean {
    // Buscar en campos comunes
    const searchableFields = ['titulo', 'title', 'nombre', 'name', 'descripcion', 'description', 'contenido', 'content'];

    return searchableFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(term);
      }
      return false;
    });
  }

  private matchesCategory(item: Record<string, any>, category: string): boolean {
    const itemCategory = item['categoria'] || item['category'] || item['tipo'] || item['type'];
    return itemCategory?.toLowerCase() === category.toLowerCase();
  }

  private sortItems<T extends Record<string, any>>(
    items: T[],
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): T[] {
    return items.sort((a, b) => {
      let compareResult = 0;

      switch (sortBy) {
        case 'recent':
          compareResult = this.compareDates(a, b, false);
          break;
        case 'oldest':
          compareResult = this.compareDates(a, b, true);
          break;
        case 'popular':
          compareResult = this.comparePopularity(a, b);
          break;
        case 'title':
          compareResult = this.compareStrings(a, b);
          break;
        default:
          compareResult = 0;
      }

      return sortOrder === 'desc' ? -compareResult : compareResult;
    });
  }

  private compareDates(a: Record<string, any>, b: Record<string, any>, oldest: boolean): number {
    const dateA = this.getDate(a);
    const dateB = this.getDate(b);

    if (!dateA || !dateB) return 0;

    return oldest
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  }

  private getDate(item: Record<string, any>): Date | null {
    const dateValue = item['fecha'] || item['date'] || item['createdAt'] || item['fechaCreacion'];

    if (dateValue instanceof Date) {
      return dateValue;
    }

    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  private comparePopularity(a: Record<string, any>, b: Record<string, any>): number {
    const popularityA = this.getPopularity(a);
    const popularityB = this.getPopularity(b);

    return popularityB - popularityA;
  }

  private getPopularity(item: Record<string, any>): number {
    // Combinar diferentes métricas de popularidad
    const likes = item['likes'] || item['me_gusta'] || 0;
    const views = item['vistas'] || item['views'] || 0;
    const comments = item['comentarios'] || item['comments'] || 0;
    const asistentes = item['asistentes'] || item['attendees'] || 0;

    // Ponderación: likes x3, comentarios x2, resto x1
    return (likes * 3) + (comments * 2) + views + asistentes;
  }

  private compareStrings(a: Record<string, any>, b: Record<string, any>): number {
    const stringA = (a['titulo'] || a['title'] || a['nombre'] || a['name'] || '').toLowerCase();
    const stringB = (b['titulo'] || b['title'] || b['nombre'] || b['name'] || '').toLowerCase();

    return stringA.localeCompare(stringB);
  }

  /**
   * Obtiene categorías únicas de una lista de items
   */
  getUniqueCategories<T extends Record<string, any>>(items: T[]): string[] {
    const categories = new Set<string>();

    items.forEach(item => {
      const category = item['categoria'] || item['category'] || item['tipo'] || item['type'];
      if (category) {
        categories.add(category);
      }
    });

    return Array.from(categories).sort();
  }
}
