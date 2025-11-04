import { Component, OnInit } from '@angular/core';
import { GruposService } from '../../services/grupos.service';
import { Grupo, GrupoCreate, Miembro, MiembroCreate, MiembroRolUpdate } from '../../models/grupo.model';
import { AlertService } from '../../../../shared/services/alert.service';
import { StorageService } from '../../../../shared/services/storage.service';
import { UsuarioService } from '../../../../shared/services/usuario.service';

@Component({
  selector: 'app-grupos',
  standalone: false,
  templateUrl: './grupos.html',
  styleUrl: './grupos.css',
})
export class Grupos implements OnInit {
  grupos: Grupo[] = [];
  gruposFiltrados: Grupo[] = [];
  grupoSeleccionado: Grupo | null = null;
  miembros: Miembro[] = [];
  
  mostrarFormulario = false;
  mostrarModalMiembros = false;
  cargando = false;
  
  // Usuario actual
  usuarioActual: any = null;
  
  // Filtros
  busqueda = '';
  soloMisGrupos = false;
  
  // Formulario de grupo
  nuevoGrupo: GrupoCreate = {
    nombre: '',
    descripcion: ''
  };
  
  // Formulario de agregar miembro
  emailNuevoMiembro = '';
  rolNuevoMiembro: 'miembro' | 'moderador' | 'administrador' = 'miembro';
  
  // Estado de edición
  grupoEditando: number | null = null;
  modoEdicion = false;

  constructor(
    private gruposService: GruposService,
    private alertService: AlertService,
    private storageService: StorageService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.storageService.getItem('usuario');
    
    if (!this.usuarioActual && localStorage.getItem('token')) {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const rol = localStorage.getItem('rol');
      
      if (userId) {
        this.usuarioActual = {
          id_usuario: parseInt(userId),
          nombre: userName || '',
          correo: userEmail || '',
          id_rol: parseInt(rol || '0')
        };
        this.storageService.setItem('usuario', this.usuarioActual);
      }
    }
    
    this.cargarGrupos();
  }

  cargarGrupos(): void {
    this.cargando = true;
    
    const observable = this.soloMisGrupos && this.usuarioActual
      ? this.gruposService.getMisGrupos()
      : this.gruposService.getGrupos();
    
    observable.subscribe({
      next: (grupos) => {
        this.grupos = grupos;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        
        if (error.response?.status === 404 || error.response?.status === 500) {
          this.alertService.warning(
            'Módulo en desarrollo',
            'El módulo de grupos de estudio aún no está disponible en el servidor.'
          );
        } else {
          this.alertService.error('Error', 'No se pudieron cargar los grupos.');
        }
        
        this.grupos = [];
        this.aplicarFiltros();
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.grupos];
    
    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(grupo => 
        grupo.nombre.toLowerCase().includes(busquedaLower) ||
        grupo.descripcion?.toLowerCase().includes(busquedaLower)
      );
    }
    
    this.gruposFiltrados = resultado;
  }

  onBusquedaChange(busqueda: string): void {
    this.busqueda = busqueda;
    this.aplicarFiltros();
  }

  toggleSoloMisGrupos(): void {
    this.soloMisGrupos = !this.soloMisGrupos;
    this.cargarGrupos();
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.resetearFormulario();
    }
  }

  resetearFormulario(): void {
    this.nuevoGrupo = {
      nombre: '',
      descripcion: ''
    };
    this.modoEdicion = false;
    this.grupoEditando = null;
  }

  crearGrupo(): void {
    if (!this.nuevoGrupo.nombre.trim()) {
      this.alertService.warning('Campo incompleto', 'El nombre del grupo es obligatorio');
      return;
    }

    this.cargando = true;
    this.gruposService.createGrupo(this.nuevoGrupo).subscribe({
      next: (grupo) => {
        this.alertService.success('¡Grupo creado!', 'El grupo se ha creado exitosamente');
        this.toggleFormulario();
        this.cargarGrupos();
      },
      error: () => {
        this.alertService.error('Error', 'No se pudo crear el grupo');
        this.cargando = false;
      }
    });
  }

  editarGrupo(grupo: Grupo): void {
    this.modoEdicion = true;
    this.grupoEditando = grupo.id_grupo;
    this.nuevoGrupo = {
      nombre: grupo.nombre,
      descripcion: grupo.descripcion || ''
    };
    this.mostrarFormulario = true;
    
    if (this.grupoSeleccionado) {
      this.cerrarDetalle();
    }
  }

  actualizarGrupo(): void {
    if (!this.nuevoGrupo.nombre.trim()) {
      this.alertService.warning('Campo incompleto', 'El nombre del grupo es obligatorio');
      return;
    }

    if (!this.grupoEditando) {
      return;
    }

    this.cargando = true;
    this.gruposService.updateGrupo(this.grupoEditando, this.nuevoGrupo).subscribe({
      next: (grupo) => {
        this.alertService.success('¡Grupo actualizado!', 'Los cambios se han guardado exitosamente');
        this.toggleFormulario();
        this.cargarGrupos();
      },
      error: () => {
        this.alertService.error('Error', 'No se pudo actualizar el grupo');
        this.cargando = false;
      }
    });
  }

  guardarGrupo(): void {
    if (this.modoEdicion) {
      this.actualizarGrupo();
    } else {
      this.crearGrupo();
    }
  }

  verDetalle(grupo: Grupo): void {
    this.grupoSeleccionado = grupo;
    this.cargarMiembros(grupo.id_grupo);
  }

  cerrarDetalle(): void {
    this.grupoSeleccionado = null;
    this.miembros = [];
  }

  cargarMiembros(grupoId: number): void {
    this.gruposService.getMiembros(grupoId).subscribe({
      next: (miembros) => {
        this.miembros = miembros;
      },
      error: () => {}
    });
  }

  eliminarGrupo(grupoId: number): void {
    this.alertService.confirm(
      '¿Eliminar grupo?',
      'Esta acción eliminará el grupo y todos sus miembros. No se puede deshacer.'
    ).then((result) => {
      if (result.isConfirmed) {
        this.gruposService.deleteGrupo(grupoId).subscribe({
          next: () => {
            this.alertService.toast('Grupo eliminado', 'success');
            this.cerrarDetalle();
            this.cargarGrupos();
          },
          error: () => {
            this.alertService.error('Error', 'No se pudo eliminar el grupo');
          }
        });
      }
    });
  }

  salirDelGrupo(grupoId: number): void {
    if (!this.usuarioActual) return;

    this.alertService.confirm(
      '¿Salir del grupo?',
      'Dejarás de ser miembro de este grupo'
    ).then((result) => {
      if (result.isConfirmed) {
        this.gruposService.removeMiembro(grupoId, this.usuarioActual.id_usuario).subscribe({
          next: () => {
            this.alertService.toast('Has salido del grupo', 'success');
            this.cerrarDetalle();
            this.cargarGrupos();
          },
          error: () => {
            this.alertService.error('Error', 'No se pudo salir del grupo');
          }
        });
      }
    });
  }

  cambiarRolMiembro(grupoId: number, userId: number, nuevoRol: 'administrador' | 'moderador' | 'miembro'): void {
    this.gruposService.updateMiembroRol(grupoId, userId, { rol_grupo: nuevoRol }).subscribe({
      next: (grupo) => {
        this.alertService.toast('Rol actualizado', 'success');
        this.cargarMiembros(grupoId);
        this.cargarGrupos();
      },
      error: () => {
        this.alertService.error('Error', 'No se pudo cambiar el rol del miembro');
      }
    });
  }

  removerMiembro(grupoId: number, userId: number, nombreMiembro: string): void {
    this.alertService.confirm(
      '¿Remover miembro?',
      `¿Estás seguro de remover a ${nombreMiembro} del grupo?`
    ).then((result) => {
      if (result.isConfirmed) {
        this.gruposService.removeMiembro(grupoId, userId).subscribe({
          next: () => {
            this.alertService.toast('Miembro removido', 'success');
            this.cargarMiembros(grupoId);
            this.cargarGrupos();
          },
          error: () => {
            this.alertService.error('Error', 'No se pudo remover al miembro');
          }
        });
      }
    });
  }

  toggleModalMiembros(): void {
    this.mostrarModalMiembros = !this.mostrarModalMiembros;
    if (!this.mostrarModalMiembros) {
      this.emailNuevoMiembro = '';
      this.rolNuevoMiembro = 'miembro';
    }
  }

  async agregarMiembro(): Promise<void> {
    if (!this.grupoSeleccionado) return;
    
    if (!this.emailNuevoMiembro.trim()) {
      this.alertService.warning('Campo incompleto', 'Debes ingresar el correo del usuario');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.emailNuevoMiembro)) {
      this.alertService.warning('Email inválido', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    this.cargando = true;

    try {
      // Buscar usuario por email
      const usuario = await this.usuarioService.buscarUsuarioPorEmail(this.emailNuevoMiembro.trim());
      
      if (!usuario) {
        this.alertService.warning('Usuario no encontrado', 'No existe un usuario registrado con ese correo electrónico');
        this.cargando = false;
        return;
      }

      // Crear el objeto con id_usuario
      const nuevoMiembro: MiembroCreate = {
        id_usuario: usuario.id_usuario!,
        rol_grupo: this.rolNuevoMiembro
      };

      // Agregar miembro al grupo
      this.gruposService.addMiembro(this.grupoSeleccionado.id_grupo, nuevoMiembro).subscribe({
        next: () => {
          this.alertService.success('¡Miembro agregado!', `${usuario.nombre} ${usuario.apellido} ha sido agregado al grupo`);
          this.toggleModalMiembros();
          this.cargarMiembros(this.grupoSeleccionado!.id_grupo);
          this.cargarGrupos();
          this.cargando = false;
        },
        error: (error) => {
          let mensaje = 'No se pudo agregar al miembro';
          
          if (error.response?.data?.error) {
            mensaje = error.response.data.error;
          } else if (error.response?.data?.message) {
            mensaje = error.response.data.message;
          } else if (error.response?.status === 404) {
            mensaje = 'El endpoint de agregar miembros no está disponible en el backend';
          } else if (error.response?.status === 400) {
            mensaje = 'El usuario ya es miembro del grupo o los datos son inválidos';
          }
          
          this.alertService.error('Error', mensaje);
          this.cargando = false;
        }
      });
    } catch (error) {
      this.alertService.error('Error', 'No se pudo buscar el usuario. Verifica tu conexión.');
      this.cargando = false;
    }
  }

  unirseAlGrupo(grupoId: number): void {
    if (!this.usuarioActual) return;

    const nuevoMiembro: MiembroCreate = {
      id_usuario: this.usuarioActual.id_usuario,
      rol_grupo: 'miembro'
    };

    this.cargando = true;
    this.gruposService.addMiembro(grupoId, nuevoMiembro).subscribe({
      next: () => {
        this.alertService.success('¡Te has unido!', 'Ahora eres miembro de este grupo');
        this.cargarMiembros(grupoId);
        this.cargarGrupos();
        this.cargando = false;
      },
      error: (error) => {
        let mensaje = 'No se pudo unir al grupo';
        if (error.response?.data?.error) {
          mensaje = error.response.data.error;
        } else if (error.response?.data?.message) {
          mensaje = error.response.data.message;
        } else if (error.response?.status === 400) {
          mensaje = 'Ya eres miembro de este grupo';
        }
        
        this.alertService.error('Error', mensaje);
        this.cargando = false;
      }
    });
  }

  esAdministrador(grupo: Grupo): boolean {
    if (!this.usuarioActual) return false;
    
    const miembro = grupo.miembros?.find(m => m.id_usuario === this.usuarioActual.id_usuario);
    return miembro?.rol_grupo === 'administrador' || this.usuarioActual.id_rol === 1;
  }

  esMiembro(grupo: Grupo): boolean {
    if (!this.usuarioActual) return false;
    
    return grupo.miembros?.some(m => m.id_usuario === this.usuarioActual.id_usuario) || false;
  }

  getMiRol(grupo: Grupo): string {
    if (!this.usuarioActual) return '';
    
    const miembro = grupo.miembros?.find(m => m.id_usuario === this.usuarioActual.id_usuario);
    return miembro?.rol_grupo || '';
  }

  getRolBadgeClass(rol: string): string {
    switch (rol) {
      case 'administrador': return 'badge-admin';
      case 'moderador': return 'badge-moderador';
      case 'miembro': return 'badge-miembro';
      default: return '';
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
