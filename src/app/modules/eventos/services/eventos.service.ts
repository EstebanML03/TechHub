import { Injectable } from '@angular/core';
import apiClient from 'src/shared/services/api-client';
import { 
  Evento, 
  EventoConRelaciones, 
  CreateEventoRequest, 
  UpdateEventoRequest, 
  InscripcionEvento 
} from '../models/evento.model';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  
  constructor() {}

  // ==================== CRUD DE EVENTOS ====================

  /**
   * Obtener todos los eventos
   */
  async obtenerEventos(): Promise<EventoConRelaciones[]> {
    try {
      // Primero intentar con parámetro select básico para evitar errores de relaciones
      const response = await apiClient.get('/eventos?select=*');
      
      // La respuesta puede venir en response.data.data o directamente en response.data
      const eventos = response.data?.data || response.data || [];
      
      // Filtrar eventos: excluir categoría "Emprendimiento" (id_categoria = 9)
      const eventosFiltrados = eventos.filter((evento: any) => evento.id_categoria !== 9);
      
      // Si los eventos no tienen las propiedades de relaciones, las inicializamos
      return eventosFiltrados.map((evento: any) => ({
        ...evento,
        categoria: evento.categoria || null,
        organizador: evento.organizador || null,
        inscritos: evento.inscritos || [],
        total_inscritos: evento.total_inscritos || evento.inscritos?.length || 0,
        esta_inscrito: evento.esta_inscrito || false
      }));
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Obtener un evento por ID
   */
  async obtenerEventoPorId(id: number): Promise<EventoConRelaciones> {
    try {
      const response = await apiClient.get(`/eventos/${id}`);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Obtener eventos del usuario actual (eventos que YO creé)
   * NOTA: Según la API actual, /eventos/mis-eventos devuelve eventos INSCRITOS
   * Para eventos CREADOS por mí, filtramos /eventos por id_usuario
   */
  async obtenerMisEventos(): Promise<EventoConRelaciones[]> {
    try {
      // Obtener todos los eventos
      const response = await apiClient.get('/eventos');
      const todosEventos = response.data?.data || response.data || [];
      
      // Obtener el ID del usuario actual - probar diferentes keys
      let userId = parseInt(localStorage.getItem('userId') || '0');
      
      // Si userId es 0, intentar con otras keys comunes
      if (userId === 0) {
        userId = parseInt(localStorage.getItem('id_usuario') || '0');
      }
      if (userId === 0) {
        userId = parseInt(localStorage.getItem('user_id') || '0');
      }
      if (userId === 0) {
        userId = parseInt(localStorage.getItem('id') || '0');
      }
      
      // Filtrar: eventos que YO creé Y que NO sean de categoría Emprendimiento (id_categoria = 9)
      const misEventos = todosEventos.filter((evento: any) => {
        const eventoUserId = parseInt(evento.id_usuario) || evento.id_usuario;
        const match = eventoUserId == userId; // Usar == para comparación flexible
        const noEsEmprendimiento = evento.id_categoria !== 9;
        return match && noEsEmprendimiento;
      });
      
      // Mapear para asegurar que tengan las propiedades necesarias
      return misEventos.map((evento: any) => ({
        ...evento,
        categoria: evento.categoria || null,
        organizador: evento.organizador || null,
        inscritos: evento.inscritos || [],
        total_inscritos: evento.total_inscritos || evento.inscritos?.length || 0,
        esta_inscrito: evento.esta_inscrito || false
      }));
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Crear un nuevo evento
   */
  async crearEvento(data: CreateEventoRequest): Promise<Evento> {
    try {
      // Obtener el userId del localStorage
      let userId = parseInt(localStorage.getItem('userId') || '0');
      
      // Si userId es 0, intentar con otras keys
      if (userId === 0) {
        userId = parseInt(localStorage.getItem('id_usuario') || '0');
      }
      if (userId === 0) {
        userId = parseInt(localStorage.getItem('user_id') || '0');
      }
      if (userId === 0) {
        userId = parseInt(localStorage.getItem('id') || '0');
      }
      
      // Agregar el id_usuario al evento
      const eventoConUsuario = { ...data, id_usuario: userId };
      
      const response = await apiClient.post('/eventos', eventoConUsuario);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Actualizar un evento existente
   * NOTA: Solo admin (rol 1) puede actualizar eventos según la API
   * Si no eres admin, esto devolverá 403 Forbidden
   */
  async actualizarEvento(id: number, data: UpdateEventoRequest): Promise<Evento> {
    try {
      const response = await apiClient.put(`/eventos/${id}`, data);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para actualizar este evento (solo admin)');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Error al actualizar evento');
    }
  }

  /**
   * Eliminar un evento
   * NOTA: Solo admin (rol 1) puede eliminar eventos según la API
   * Si no eres admin, esto devolverá 403 Forbidden
   */
  async eliminarEvento(id: number): Promise<void> {
    try {
      await apiClient.delete(`/eventos/${id}`);
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para eliminar este evento (solo admin)');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Error al eliminar evento');
    }
  }

  // ==================== INSCRIPCIONES ====================

  /**
   * Inscribirse a un evento
   */
  async inscribirseEvento(idEvento: number): Promise<InscripcionEvento> {
    try {
      const response = await apiClient.post(`/eventos/${idEvento}/inscribirse`);
      
      return response.data?.data || response.data;
    } catch (error: any) {
      // Manejar error 409 (Conflict) - Ya inscrito
      if (error.response?.status === 409) {
        throw new Error('Ya estás inscrito en este evento');
      }
      
      // Otros errores
      throw new Error(error.response?.data?.message || error.message || 'Error al inscribirse');
    }
  }

  /**
   * Cancelar inscripción a un evento
   * Endpoint correcto: DELETE /eventos/{id}/cancelar-inscripcion
   */
  async cancelarInscripcion(idEvento: number): Promise<void> {
    try {
      await apiClient.delete(`/eventos/${idEvento}/cancelar-inscripcion`);
    } catch (error: any) {
      // Manejar error 404 (Not Found) - No está inscrito
      if (error.response?.status === 404) {
        throw new Error('No estás inscrito en este evento');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Error al cancelar inscripción');
    }
  }

  /**
   * Obtener eventos a los que el usuario está inscrito
   * Según la API: GET /eventos/mis-eventos devuelve eventos inscritos
   */
  async obtenerEventosInscritos(): Promise<EventoConRelaciones[]> {
    try {
      const response = await apiClient.get('/eventos/mis-eventos');
      
      // Mapear y filtrar para asegurar que tengan las propiedades necesarias
      const eventos = response.data?.data || response.data || [];
      
      // Filtrar: excluir emprendimientos (id_categoria = 9)
      const eventosFiltrados = eventos.filter((evento: any) => evento.id_categoria !== 9);
      
      return eventosFiltrados.map((evento: any) => ({
        ...evento,
        categoria: evento.categoria || null,
        organizador: evento.organizador || null,
        inscritos: evento.inscritos || [],
        total_inscritos: evento.total_inscritos || evento.inscritos?.length || 0,
        esta_inscrito: true // Si está en esta lista, está inscrito
      }));
    } catch (error: any) {
      // Si el endpoint no está implementado, devolver array vacío
      if (error.response?.status === 400 || error.response?.status === 404) {
        return [];
      }
      
      throw error;
    }
  }

  /**
   * Obtener inscritos de un evento
   */
  async obtenerInscritos(idEvento: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`/eventos/${idEvento}/inscritos`);
      
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      throw error;
    }
  }

  // ==================== UTILIDADES ====================

  /**
   * Verificar si el usuario está inscrito en un evento
   * NOTA: Esta verificación se hace del lado del cliente con los datos ya cargados
   * El backend incluye 'esta_inscrito' en la respuesta de GET /eventos
   */
  estaInscrito(evento: EventoConRelaciones): boolean {
    return evento.esta_inscrito || false;
  }

  /**
   * Verificar si el usuario es el organizador del evento
   */
  esOrganizador(evento: EventoConRelaciones, idUsuario: number): boolean {
    return evento.id_usuario === idUsuario || evento.organizador?.id_usuario === idUsuario;
  }

  /**
   * Formatear fecha de evento
   */
  formatearFecha(fecha: Date | string): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Verificar si un evento ya pasó
   */
  eventoPasado(fecha: Date | string): boolean {
    const fechaEvento = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaEvento < new Date();
  }

  /**
   * Obtener badge de modalidad
   */
  getModalidadBadge(modalidad?: string): { color: string; label: string } {
    switch (modalidad?.toLowerCase()) {
      case 'presencial':
        return { color: 'primary', label: 'Presencial' };
      case 'virtual':
        return { color: 'success', label: 'Virtual' };
      case 'híbrido':
      case 'hibrido':
        return { color: 'info', label: 'Híbrido' };
      default:
        return { color: 'secondary', label: 'Sin especificar' };
    }
  }
}
