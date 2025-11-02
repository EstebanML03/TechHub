import apiClient from 'src/shared/services/api-client';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Método para iniciar sesión
  async login(email: string, password: string): Promise<void> {
    try {
      const response = await apiClient.post('/usuarios/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token); // Guardar el token en localStorage
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      throw error;
    }
  }

  // Método para registrar un nuevo usuario
  async register(userData: { nombre: string; apellido: string; email: string; password: string; cedula: string; id_rol: number }): Promise<void> {
    try {
      await apiClient.post('/usuarios/register', userData);
    } catch (error) {
      console.error('Error en el registro:', error);
      throw error;
    }
  }

  // Método para cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
