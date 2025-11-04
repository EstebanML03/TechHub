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
      console.log('bteniendo todas las categorías...');
      const response = await apiClient.get('/categorias');
      console.log('Categorías obtenidas:', response.data);
      
      const categorias = response.data?.data || response.data || [];
      return categorias;
    } catch (error: any) {
      console.error('Error al obtener categorías:', error);
      console.error('Error response:', error.response);
      console.error(' rror data:', error.response?.data);
      
      // Si el endpoint no existe, devolver array vacío
      if (error.response?.status === 404 || error.response?.status === 400) {
        console.warn('ndpoint /categorias no está disponible, devolviendo array vacío');
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
      console.log(`bteniendo categoría con ID: ${id}`);
      const response = await apiClient.get(`/categorias/${id}`);
      console.log('Categoría obtenida:', response.data);
      
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error(`Error al obtener categoría ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear una nueva categoría (requiere autenticación)
   */
  async crearCategoria(data: { nombre: string; descripcion?: string }): Promise<Categoria> {
    try {
      console.log('Creando nueva categoría:', data);
      const response = await apiClient.post('/categorias', data);
      console.log('Categoría creada:', response.data);
      
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  }

  /**
   * Actualizar una categoría existente (requiere autenticación)
   */
  async actualizarCategoria(id: number, data: { nombre?: string; descripcion?: string }): Promise<Categoria> {
    try {
      console.log(`Actualizando categoría ${id}:`, data);
      const response = await apiClient.put(`/categorias/${id}`, data);
      console.log('Categoría actualizada:', response.data);
      
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error(`Error al actualizar categoría ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar una categoría (solo admin - rol 1)
   */
  async eliminarCategoria(id: number): Promise<void> {
    try {
      console.log(`Eliminando categoría ${id}...`);
      await apiClient.delete(`/categorias/${id}`);
      console.log('Categoría eliminada exitosamente');
    } catch (error: any) {
      console.error(`Error al eliminar categoría ${id}:`, error);
      
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para eliminar esta categoría (solo admin)');
      }
      
      throw error;
    }
  }
}
