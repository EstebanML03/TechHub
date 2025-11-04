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
      console.log('Obteniendo todos los eventos...');
      
      // Primero intentar con parámetro select básico para evitar errores de relaciones
      const response = await apiClient.get('/eventos?select=*');
      console.log('Eventos obtenidos:', response.data);
      
      // La respuesta puede venir en response.data.data o directamente en response.data
      const eventos = response.data?.data || response.data || [];
      
      // Si los eventos no tienen las propiedades de relaciones, las inicializamos
      return eventos.map((evento: any) => ({
        ...evento,
        categoria: evento.categoria || null,
        organizador: evento.organizador || null,
        inscritos: evento.inscritos || [],
        total_inscritos: evento.total_inscritos || evento.inscritos?.length || 0,
        esta_inscrito: evento.esta_inscrito || false
      }));
    } catch (error: any) {
      console.error('Error al obtener eventos:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      // Mensaje más claro para el backend
      if (error.response?.data?.message?.includes('relationship')) {
        console.error(' ERROR DEL BACKEND: Faltan foreign keys en la base de datos.');
        console.error('Ver BACKEND_EVENTOS_API_SPEC.md para la solución SQL completa');
      }
      
      throw error;
    }
  }

  /**
   * Obtener un evento por ID
   */
  async obtenerEventoPorId(id: number): Promise<EventoConRelaciones> {
    try {
      console.log(`Obteniendo evento con ID: ${id}`);
      const response = await apiClient.get(`/eventos/${id}`);
      console.log('vento obtenido:', response.data);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`Error al obtener evento ${id}:`, error);
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
      console.log('Obteniendo mis eventos creados...');
      
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
      
      console.log('Mi userId desde localStorage:', userId);
      console.log('LocalStorage completo:', {
        userId: localStorage.getItem('userId'),
        id_usuario: localStorage.getItem('id_usuario'),
        user_id: localStorage.getItem('user_id'),
        id: localStorage.getItem('id'),
        token: localStorage.getItem('token') ? 'existe' : 'no existe'
      });
      console.log('Total de eventos:', todosEventos.length);
      
      // Log completo del primer evento para ver todos sus campos
      if (todosEventos.length > 0) {
        console.log('Primer evento completo:', todosEventos[0]);
        console.log('Campos del primer evento:', Object.keys(todosEventos[0]));
      }
      
      console.log('Eventos con sus id_usuario:', todosEventos.map((e: any) => ({
        nombre: e.nombre,
        id_usuario: e.id_usuario,
        usuario_id: e.usuario_id,
        userId: e.userId,
        creador_id: e.creador_id,
        organizador: e.organizador
      })));
      
      // Filtrar solo los eventos que YO creé
      // Comparar como números para evitar problemas de tipo
      const misEventos = todosEventos.filter((evento: any) => {
        const eventoUserId = parseInt(evento.id_usuario) || evento.id_usuario;
        const match = eventoUserId == userId; // Usar == para comparación flexible
        console.log(`Comparando: evento.id_usuario=${evento.id_usuario} (${typeof evento.id_usuario}) == userId=${userId} (${typeof userId}) = ${match}`);
        return match;
      });
      
      console.log(`Encontrados ${misEventos.length} eventos creados por mí`);
      
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
      console.error('Error al obtener mis eventos:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
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
      const eventoConUsuario = {
        ...data,
        id_usuario: userId
      };
      
      console.log('📅 Creando nuevo evento con id_usuario:', eventoConUsuario);
      const response = await apiClient.post('/eventos', eventoConUsuario);
      console.log('✅ Evento creado:', response.data);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al crear evento:', error);
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
      console.log(`📅 Actualizando evento ${id}:`, data);
      const response = await apiClient.put(`/eventos/${id}`, data);
      console.log('✅ Evento actualizado:', response.data);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error al actualizar evento ${id}:`, error);
      
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
      console.log(`📅 Eliminando evento ${id}...`);
      await apiClient.delete(`/eventos/${id}`);
      console.log('✅ Evento eliminado exitosamente');
    } catch (error: any) {
      console.error(`❌ Error al eliminar evento ${id}:`, error);
      
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
      console.log(`📝 Inscribiéndose al evento ${idEvento}...`);
      const response = await apiClient.post(`/eventos/${idEvento}/inscribirse`);
      console.log('✅ Inscripción exitosa:', response.data);
      
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error(`❌ Error al inscribirse al evento ${idEvento}:`, error);
      
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
      console.log(`🗑️ Cancelando inscripción del evento ${idEvento}...`);
      await apiClient.delete(`/eventos/${idEvento}/cancelar-inscripcion`);
      console.log('✅ Inscripción cancelada');
    } catch (error: any) {
      console.error(`❌ Error al cancelar inscripción del evento ${idEvento}:`, error);
      
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
      console.log('📅 Obteniendo eventos inscritos...');
      const response = await apiClient.get('/eventos/mis-eventos');
      console.log('✅ Eventos inscritos obtenidos:', response.data);
      
      // Mapear para asegurar que tengan las propiedades necesarias
      const eventos = response.data?.data || response.data || [];
      return eventos.map((evento: any) => ({
        ...evento,
        categoria: evento.categoria || null,
        organizador: evento.organizador || null,
        inscritos: evento.inscritos || [],
        total_inscritos: evento.total_inscritos || evento.inscritos?.length || 0,
        esta_inscrito: true // Si está en esta lista, está inscrito
      }));
    } catch (error: any) {
      console.error('❌ Error al obtener eventos inscritos:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      
      // Si el endpoint no está implementado, devolver array vacío
      if (error.response?.status === 400 || error.response?.status === 404) {
        console.warn('⚠️ Endpoint /eventos/mis-eventos no está disponible aún');
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
      console.log(`📅 Obteniendo inscritos del evento ${idEvento}...`);
      const response = await apiClient.get(`/eventos/${idEvento}/inscritos`);
      console.log('✅ Inscritos obtenidos:', response.data);
      
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error(`❌ Error al obtener inscritos del evento ${idEvento}:`, error);
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
