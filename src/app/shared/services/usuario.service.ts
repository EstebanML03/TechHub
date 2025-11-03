import { Injectable } from '@angular/core';
import apiClient from 'src/shared/services/api-client';
import { Usuario, UsuarioSinContrasena } from 'src/app/modules/auth/models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  // Listar todos los usuarios (requiere autenticación)
  async listarUsuarios(): Promise<UsuarioSinContrasena[]> {
    try {
      return await apiClient.get('/usuarios');
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      throw error;
    }
  }

  // Obtener usuario por ID (requiere autenticación)
  async obtenerUsuarioPorId(id: number): Promise<UsuarioSinContrasena> {
    try {
      return await apiClient.get(`/usuarios/${id}`);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  // Actualizar usuario (solo el propio usuario o admin)
  async actualizarUsuario(id: number, data: Partial<Usuario>): Promise<UsuarioSinContrasena> {
    try {
      return await apiClient.put(`/usuarios/${id}`, data);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // Eliminar usuario (solo admin - rol 1)
  async eliminarUsuario(id: number): Promise<void> {
    try {
      await apiClient.delete(`/usuarios/${id}`);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
}
