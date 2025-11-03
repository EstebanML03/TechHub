import { Injectable } from '@angular/core';
import apiClient from 'src/shared/services/api-client';
import { UsuarioSinContrasena } from '../../auth/models/usuario.model';

export interface ActualizarPerfilRequest {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  carrera?: string;
  foto_perfil?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PerfilService {
  // Obtener el perfil del usuario actual
  async obtenerPerfil(): Promise<UsuarioSinContrasena> {
    try {
      return await apiClient.get('/usuarios/profile');
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
      throw error;
    }
  }

  // Actualizar el perfil del usuario (necesita el ID del usuario)
  async actualizarPerfil(idUsuario: number, data: ActualizarPerfilRequest): Promise<UsuarioSinContrasena> {
    try {
      return await apiClient.put(`/usuarios/${idUsuario}`, data);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      throw error;
    }
  }

  // Cambiar la contraseña del usuario
  async cambiarContrasena(contrasenaActual: string, contrasenaNueva: string): Promise<void> {
    try {
      await apiClient.put('/usuarios/change-password', {
        contrasenaActual,
        contrasenaNueva
      });
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      throw error;
    }
  }

  // Subir foto de perfil
  async subirFotoPerfil(archivo: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('foto', archivo);
      
      // Nota: Este endpoint podría requerir una configuración diferente para FormData
      const response = await fetch(`${apiClient}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al subir la foto');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error al subir la foto de perfil:', error);
      throw error;
    }
  }
}
