import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, User, Mail, Phone, GraduationCap, CreditCard, Shield, Calendar, Edit2, Check, X, Camera } from 'lucide-angular';
import { UsuarioPerfil } from '../../models/perfil.model';
import { AlertService } from '../../../../shared/services/alert.service';
import { PerfilService } from '../../services/perfil.service';
import localeEs from '@angular/common/locales/es';

// Registrar locale español
registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  perfil: UsuarioPerfil = {
    nombre: '',
    apellido: '',
    cedula: '',
    correo: '',
    id_rol: 2 // Usuario por defecto
  };

  editando: boolean = false;
  perfilEditado: UsuarioPerfil = { ...this.perfil };
  avatarPreview: string = '';
  iniciales: string = 'U';
  cargando: boolean = false;

  constructor(
    private alertService: AlertService,
    private perfilService: PerfilService,
    private router: Router
  ) {
    this.calcularIniciales();
  }

  async ngOnInit(): Promise<void> {
    await this.cargarPerfil();
  }

  async cargarPerfil(): Promise<void> {
    this.cargando = true;
    try {
      this.perfil = await this.perfilService.obtenerPerfil();
      this.perfilEditado = { ...this.perfil };
      this.calcularIniciales();
    } catch (error) {
      await this.alertService.error('Error', 'No se pudo cargar el perfil');
    } finally {
      this.cargando = false;
    }
  }

  calcularIniciales(): void {
    if (!this.perfil.nombre) {
      this.iniciales = 'U';
      return;
    }
    const nombres = this.perfil.nombre.split(' ');
    this.iniciales = nombres.map((n: string) => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  activarEdicion(): void {
    this.editando = true;
    this.perfilEditado = { ...this.perfil };
  }

  async guardarCambios(): Promise<void> {
    if (!this.validarPerfil()) {
      this.alertService.warning('Datos incompletos', 'Por favor completa los campos obligatorios');
      return;
    }

    this.cargando = true;
    try {
      // Preparar los datos para enviar a la API
      const datosActualizados = {
        nombre: this.perfilEditado.nombre,
        apellido: this.perfilEditado.apellido,
        telefono: this.perfilEditado.telefono,
        carrera: this.perfilEditado.carrera
      };

      // Verificar que tenemos el ID del usuario
      if (!this.perfil.id_usuario) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      // Actualizar el perfil en la API
      await this.perfilService.actualizarPerfil(this.perfil.id_usuario, datosActualizados);
      
      // Actualizar los datos locales
      this.perfil = { ...this.perfilEditado };
      this.editando = false;
      this.calcularIniciales();

      await this.alertService.success('¡Perfil actualizado!', 'Tus cambios se han guardado exitosamente');
    } catch (error) {
      await this.alertService.error('Error', 'No se pudo actualizar el perfil');
    } finally {
      this.cargando = false;
    }
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.perfilEditado = { ...this.perfil };
    this.avatarPreview = '';
  }

  validarPerfil(): boolean {
    return !!(this.perfilEditado.nombre && this.perfilEditado.correo);
  }

  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.alertService.error('Archivo muy grande', 'El avatar no puede ser mayor a 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarAvatar(): void {
    this.avatarPreview = '';
  }

  volverSettings(): void {
    this.router.navigate(['/settings']);
  }
}
