import { Component, OnInit } from '@angular/core';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ComentariosService } from '../../services/comentarios.service';
import { EtiquetasService } from '../../services/etiquetas.service';
import { CategoriasService } from '../../../eventos/services/categorias.service';
import { Publicacion, PublicacionCreate, Comentario, ComentarioCreate, Etiqueta } from '../../models/post.model';
import { Categoria } from '../../../eventos/models/evento.model';
import { AlertService } from '../../../../shared/services/alert.service';
import { StorageService } from '../../../../shared/services/storage.service';

@Component({
  selector: 'app-blog',
  standalone: false,
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class Blog implements OnInit {
  publicaciones: Publicacion[] = [];
  publicacionesFiltradas: Publicacion[] = [];
  publicacionSeleccionada: Publicacion | null = null;
  
  comentarios: Comentario[] = [];
  comentariosCount: { [key: number]: number } = {};
  
  categorias: Categoria[] = [];
  etiquetas: Etiqueta[] = [];
  
  mostrarFormulario = false;
  nuevoComentario = '';
  cargando = false;
  
  // Usuario actual
  usuarioActual: any = null;
  
  // Filtros
  categoriaFiltro: number | null = null;
  busqueda = '';
  
  // Formulario de publicación
  nuevoPost: PublicacionCreate = {
    titulo: '',
    contenido: '',
    id_categoria: 0,
    tipo: 'articulo',
    etiquetas: []
  };
  
  // Estado de edición de publicación
  publicacionEditando: number | null = null;
  modoEdicion = false;
  
  // Estado de edición de comentario
  comentarioEditando: number | null = null;
  comentarioEditandoTexto = '';

  constructor(
    private publicacionesService: PublicacionesService,
    private comentariosService: ComentariosService,
    private etiquetasService: EtiquetasService,
    private categoriasService: CategoriasService,
    private alertService: AlertService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    // Intentar obtener el usuario del localStorage
    this.usuarioActual = this.storageService.getItem('usuario');
    
    // Si no existe en localStorage pero hay un token, construir el objeto del usuario
    if (!this.usuarioActual && localStorage.getItem('token')) {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const rol = localStorage.getItem('rol');
      
      if (userId) {
        // Construir objeto usuario temporal con los datos individuales
        this.usuarioActual = {
          id_usuario: parseInt(userId),
          nombre: userName || '',
          correo: userEmail || '',
          id_rol: parseInt(rol || '0')
        };
        
        // Guardarlo en localStorage para futuras referencias
        this.storageService.setItem('usuario', this.usuarioActual);
      }
    }
    
    this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    this.cargando = true;
    try {
      // Cargar categorías y etiquetas
      await Promise.all([
        this.cargarCategorias(),
        this.cargarEtiquetas()
      ]);
      
      // Cargar publicaciones
      await this.cargarPublicaciones();
    } catch (error: any) {
      this.alertService.error('Error', 'No se pudieron cargar los datos del blog');
    } finally {
      this.cargando = false;
    }
  }

  async cargarPublicaciones(): Promise<void> {
    try {
      this.publicacionesService.getPublicaciones().subscribe({
        next: (publicaciones) => {
          this.publicaciones = publicaciones;
          this.aplicarFiltros();
          
          // Cargar contadores de comentarios
          publicaciones.forEach(pub => {
            this.comentariosService.countComentariosByPublicacion(pub.id_publicacion).subscribe({
              next: (result) => {
                this.comentariosCount[pub.id_publicacion] = result.count;
              },
              error: () => {}
            });
          });
        },
        error: (error) => {
          this.cargando = false;
          
          // Si el endpoint no existe (404) o hay un error del servidor (500)
          if (error.response?.status === 404 || error.response?.status === 500) {
            this.alertService.warning(
              'Módulo en desarrollo',
              'El módulo de blog aún no está disponible en el servidor. Por favor, contacta al administrador.'
            );
          } else if (error.response?.status === 401) {
            // Error de autenticación - el interceptor ya redirige
          } else {
            this.alertService.error('Error', 'No se pudieron cargar las publicaciones. Intenta nuevamente más tarde.');
          }
          
          // Mostrar array vacío para que la UI muestre el estado vacío
          this.publicaciones = [];
          this.aplicarFiltros();
        }
      });
    } catch (error) {
      this.cargando = false;
      this.publicaciones = [];
      this.aplicarFiltros();
    }
  }

  async cargarCategorias(): Promise<void> {
    try {
      this.categorias = await this.categoriasService.obtenerCategorias();
    } catch (error) {
      // Error silencioso
    }
  }

  async cargarEtiquetas(): Promise<void> {
    try {
      this.etiquetasService.getEtiquetas().subscribe({
        next: (etiquetas) => {
          this.etiquetas = etiquetas;
        },
        error: () => {}
      });
    } catch (error) {
      // Error silencioso
    }
  }

  aplicarFiltros(): void {
    let resultado = [...this.publicaciones];
    
    // Filtrar por categoría
    if (this.categoriaFiltro) {
      resultado = resultado.filter(pub => pub.id_categoria === this.categoriaFiltro);
    }
    
    // Filtrar por búsqueda
    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(pub => 
        pub.titulo.toLowerCase().includes(busquedaLower) ||
        pub.contenido.toLowerCase().includes(busquedaLower) ||
        pub.usuario?.nombre.toLowerCase().includes(busquedaLower) ||
        pub.usuario?.apellido.toLowerCase().includes(busquedaLower)
      );
    }
    
    this.publicacionesFiltradas = resultado;
  }

  onCategoriaChange(categoriaId: number | null): void {
    this.categoriaFiltro = categoriaId;
    this.aplicarFiltros();
  }

  onBusquedaChange(busqueda: string): void {
    this.busqueda = busqueda;
    this.aplicarFiltros();
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.resetearFormulario();
    }
  }

  resetearFormulario(): void {
    this.nuevoPost = {
      titulo: '',
      contenido: '',
      id_categoria: 0,
      tipo: 'articulo',
      etiquetas: []
    };
    this.modoEdicion = false;
    this.publicacionEditando = null;
  }

  editarPublicacion(publicacion: Publicacion): void {
    this.modoEdicion = true;
    this.publicacionEditando = publicacion.id_publicacion;
    this.nuevoPost = {
      titulo: publicacion.titulo,
      contenido: publicacion.contenido,
      id_categoria: publicacion.id_categoria,
      tipo: publicacion.tipo,
      etiquetas: publicacion.etiquetas?.map(e => e.id_etiqueta) || []
    };
    this.mostrarFormulario = true;
    
    // Cerrar el modal de detalle si está abierto
    this.cerrarPublicacion();
  }

  crearPublicacion(): void {
    if (!this.nuevoPost.titulo || !this.nuevoPost.contenido || !this.nuevoPost.id_categoria) {
      this.alertService.warning('Campos incompletos', 'Por favor completa título, contenido y categoría');
      return;
    }

    this.cargando = true;
    this.publicacionesService.createPublicacion(this.nuevoPost).subscribe({
      next: (publicacion) => {
        this.alertService.success('¡Publicación creada!', 'Tu artículo se ha publicado exitosamente');
        this.toggleFormulario();
        this.cargarPublicaciones();
      },
      error: () => {
        this.alertService.error('Error', 'No se pudo crear la publicación');
        this.cargando = false;
      }
    });
  }

  actualizarPublicacion(): void {
    if (!this.nuevoPost.titulo || !this.nuevoPost.contenido || !this.nuevoPost.id_categoria) {
      this.alertService.warning('Campos incompletos', 'Por favor completa título, contenido y categoría');
      return;
    }

    if (!this.publicacionEditando) {
      return;
    }

    this.cargando = true;
    this.publicacionesService.updatePublicacion(this.publicacionEditando, this.nuevoPost).subscribe({
      next: (publicacion) => {
        this.alertService.success('¡Publicación actualizada!', 'Los cambios se han guardado exitosamente');
        this.toggleFormulario();
        this.cargarPublicaciones();
      },
      error: () => {
        this.alertService.error('Error', 'No se pudo actualizar la publicación');
        this.cargando = false;
      }
    });
  }

  guardarPublicacion(): void {
    if (this.modoEdicion) {
      this.actualizarPublicacion();
    } else {
      this.crearPublicacion();
    }
  }

  verPublicacion(publicacion: Publicacion): void {
    this.publicacionSeleccionada = publicacion;
    this.nuevoComentario = '';
    this.cargarComentarios(publicacion.id_publicacion);
  }

  cerrarPublicacion(): void {
    this.publicacionSeleccionada = null;
    this.comentarios = [];
    this.comentarioEditando = null;
  }

  cargarComentarios(publicacionId: number): void {
    this.comentariosService.getComentariosByPublicacion(publicacionId).subscribe({
      next: (comentarios) => {
        this.comentarios = comentarios;
      },
      error: () => {}
    });
  }

  agregarComentario(publicacionId: number): void {
    if (!this.nuevoComentario.trim()) {
      this.alertService.warning('Comentario vacío', 'Por favor escribe un comentario');
      return;
    }

    const comentario: ComentarioCreate = {
      contenido: this.nuevoComentario,
      id_publicacion: publicacionId
    };

    this.comentariosService.createComentario(comentario).subscribe({
      next: (nuevoComentario) => {
        this.comentarios.push(nuevoComentario);
        this.comentariosCount[publicacionId] = (this.comentariosCount[publicacionId] || 0) + 1;
        this.nuevoComentario = '';
        this.alertService.toast('Comentario agregado', 'success');
      },
      error: () => {
        this.alertService.error('Error', 'No se pudo agregar el comentario');
      }
    });
  }

  editarComentario(comentario: Comentario): void {
    this.comentarioEditando = comentario.id_comentario;
    this.comentarioEditandoTexto = comentario.contenido;
  }

  cancelarEdicion(): void {
    this.comentarioEditando = null;
    this.comentarioEditandoTexto = '';
  }

  guardarComentario(comentarioId: number): void {
    if (!this.comentarioEditandoTexto.trim()) {
      this.alertService.warning('Comentario vacío', 'El comentario no puede estar vacío');
      return;
    }

    this.comentariosService.updateComentario(comentarioId, { contenido: this.comentarioEditandoTexto }).subscribe({
      next: (comentarioActualizado) => {
        const index = this.comentarios.findIndex(c => c.id_comentario === comentarioId);
        if (index !== -1) {
          this.comentarios[index] = comentarioActualizado;
        }
        this.cancelarEdicion();
        this.alertService.toast('Comentario actualizado', 'success');
      },
      error: () => {
        this.alertService.error('Error', 'No se pudo actualizar el comentario');
      }
    });
  }

  eliminarComentario(comentarioId: number, publicacionId: number): void {
    this.alertService.confirm(
      '¿Eliminar comentario?',
      'Esta acción no se puede deshacer'
    ).then((result) => {
      if (result.isConfirmed) {
        this.comentariosService.deleteComentario(comentarioId).subscribe({
          next: () => {
            this.comentarios = this.comentarios.filter(c => c.id_comentario !== comentarioId);
            this.comentariosCount[publicacionId] = Math.max(0, (this.comentariosCount[publicacionId] || 0) - 1);
            this.alertService.toast('Comentario eliminado', 'success');
          },
          error: () => {
            this.alertService.error('Error', 'No se pudo eliminar el comentario');
          }
        });
      }
    });
  }

  eliminarPublicacion(publicacionId: number): void {
    this.alertService.confirm(
      '¿Eliminar publicación?',
      'Esta acción no se puede deshacer'
    ).then((result) => {
      if (result.isConfirmed) {
        this.publicacionesService.deletePublicacion(publicacionId).subscribe({
          next: () => {
            this.cerrarPublicacion();
            this.cargarPublicaciones();
            this.alertService.toast('Publicación eliminada', 'success');
          },
          error: () => {
            this.alertService.error('Error', 'No se pudo eliminar la publicación');
          }
        });
      }
    });
  }

  puedeEditarComentario(comentario: Comentario): boolean {
    if (!this.usuarioActual) return false;
    return comentario.id_usuario === this.usuarioActual.id_usuario || this.usuarioActual.id_rol === 1;
  }

  puedeEditarPublicacion(publicacion: Publicacion): boolean {
    if (!this.usuarioActual) return false;
    return publicacion.id_usuario === this.usuarioActual.id_usuario || this.usuarioActual.id_rol === 1;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getNombreCategoria(id: number): string {
    const categoria = this.categorias.find(c => c.id_categoria === id);
    return categoria?.nombre || 'General';
  }

  getComentariosCount(publicacionId: number): number {
    return this.comentariosCount[publicacionId] || 0;
  }

  onEtiquetaChange(event: Event, etiquetaId: number): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.nuevoPost.etiquetas) {
        this.nuevoPost.etiquetas = [];
      }
      this.nuevoPost.etiquetas.push(etiquetaId);
    } else {
      if (this.nuevoPost.etiquetas) {
        this.nuevoPost.etiquetas = this.nuevoPost.etiquetas.filter(id => id !== etiquetaId);
      }
    }
  }
}
