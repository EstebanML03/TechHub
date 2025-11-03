import apiClient from 'src/shared/services/api-client';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Método para iniciar sesión
  async login(email: string, password: string): Promise<void> {
    try {
      const response = await apiClient.post('/usuarios/login', { 
        correo: email, 
        contrasena: password 
      });
      const { token } = response.data;
      localStorage.setItem('token', token); // Guardar el token en localStorage
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      throw error;
    }
  }

  // Método para registrar un nuevo usuario
  async register(userData: { nombre: string; apellido: string; email: string; password: string; cedula: string; telefono: string; carrera: string; id_rol: number }): Promise<void> {
    try {
      await apiClient.post('/usuarios/register', {
        nombre: userData.nombre,
        apellido: userData.apellido,
        correo: userData.email,
        contrasena: userData.password,
        cedula: userData.cedula,
        carrera: userData.carrera,
        telefono: userData.telefono,
        id_rol: userData.id_rol
      });
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

  // Método para obtener el token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Método para obtener el perfil del usuario actual
  async getCurrentUser(): Promise<any> {
    try {
      const response = await apiClient.get('/usuarios/profile');
      return response.data;
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
      // Si falla (token inválido/expirado), hacer logout
      this.logout();
      throw error;
    }
  }
}
