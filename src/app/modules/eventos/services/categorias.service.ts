import { Injectable } from '@angular/core';
import apiClient from 'src/shared/services/api-client';
import { Categoria } from '../models/evento.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  
  constructor() {}

  /**
   * Obtener todas las categorías disponibles
   */
  async obtenerCategorias(): Promise<Categoria[]> {
    try {
      const response = await apiClient.get('/categorias');
      
      const categorias = response.data?.data || response.data || [];
      return categorias;
    } catch (error: any) {
      // Si el endpoint no existe, devolver array vacío
      if (error.response?.status === 404 || error.response?.status === 400) {
        return [];
      }
      
      throw error;
    }
  }

  /**
   * Obtener una categoría por ID
   */
  async obtenerCategoriaPorId(id: number): Promise<Categoria> {
    try {
      const response = await apiClient.get(`/categorias/${id}`);
      
      return response.data?.data || response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Crear una nueva categoría (requiere autenticación)
   */
  async crearCategoria(data: { nombre: string; descripcion?: string }): Promise<Categoria> {
    try {
      const response = await apiClient.post('/categorias', data);
      
      return response.data?.data || response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Actualizar una categoría existente (requiere autenticación)
   */
  async actualizarCategoria(id: number, data: { nombre?: string; descripcion?: string }): Promise<Categoria> {
    try {
      const response = await apiClient.put(`/categorias/${id}`, data);
      
      return response.data?.data || response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Eliminar una categoría (solo admin - rol 1)
   */
  async eliminarCategoria(id: number): Promise<void> {
    try {
      await apiClient.delete(`/categorias/${id}`);
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para eliminar esta categoría (solo admin)');
      }
      
      throw error;
    }
  }
}
