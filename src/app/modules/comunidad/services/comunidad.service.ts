import { Injectable } from '@angular/core';
import { Miembro } from '../models/comunidad.model';
import apiClient from '../../../../shared/services/api-client';

@Injectable({
  providedIn: 'root'
})
export class ComunidadService {
  constructor() {}

  async obtenerMiembros(): Promise<Miembro[]> {
    try {
      const response = await apiClient.get('/usuarios');
      return response.data.data || response.data || [];
    } catch (error) {
      throw error;
    }
  }
}
