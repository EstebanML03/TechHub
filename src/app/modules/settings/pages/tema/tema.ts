import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ThemeService, Theme } from '../../../../shared/services/theme.service';
import { AlertService } from '../../../../shared/services/alert.service';

interface OpcionTema {
  valor: Theme;
  titulo: string;
  descripcion: string;
  icon: string;
  preview: string;
}

@Component({
  selector: 'app-tema',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './tema.html',
  styleUrl: './tema.css'
})
export class TemaComponent implements OnInit {
  temaActual: Theme = 'light';
  temaAplicado: 'light' | 'dark' = 'light';

  opciones: OpcionTema[] = [
    {
      valor: 'light',
      titulo: 'Modo Claro',
      descripcion: 'Interfaz clara y luminosa para el día',
      icon: 'sun',
      preview: 'light'
    },
    {
      valor: 'dark',
      titulo: 'Modo Oscuro',
      descripcion: 'Interfaz oscura que reduce el cansancio visual',
      icon: 'moon',
      preview: 'dark'
    },
    {
      valor: 'auto',
      titulo: 'Automático',
      descripcion: 'Se adapta a la configuración de tu sistema',
      icon: 'monitor',
      preview: 'auto'
    }
  ];

  coloresAcento = [
    { nombre: 'Azul', valor: '#3b82f6', variable: 'primary' },
    { nombre: 'Verde', valor: '#22c55e', variable: 'success' },
    { nombre: 'Naranja', valor: '#fb923c', variable: 'warning' },
    { nombre: 'Morado', valor: '#a855f7', variable: 'purple' },
    { nombre: 'Rosa', valor: '#ec4899', variable: 'pink' },
    { nombre: 'Cyan', valor: '#06b6d4', variable: 'info' }
  ];

  colorAcentoSeleccionado = '#3b82f6';

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.temaActual = this.themeService.getCurrentTheme();
    this.temaAplicado = this.themeService.getAppliedTheme();

    // Suscribirse a cambios de tema
    this.themeService.getTheme().subscribe(theme => {
      this.temaActual = theme;
      this.temaAplicado = this.themeService.getAppliedTheme();
    });

    // Cargar color de acento guardado
    const colorGuardado = localStorage.getItem('accentColor');
    if (colorGuardado) {
      this.colorAcentoSeleccionado = colorGuardado;
      this.aplicarColorAcento(colorGuardado);
    }
  }

  seleccionarTema(tema: Theme): void {
    this.themeService.setTheme(tema);
    this.alertService.success(
      'Tema actualizado',
      `Has cambiado al tema ${this.getOpcionTema(tema)?.titulo}`
    );
  }

  getOpcionTema(tema: Theme): OpcionTema | undefined {
    return this.opciones.find(o => o.valor === tema);
  }

  seleccionarColorAcento(color: string): void {
    this.colorAcentoSeleccionado = color;
    this.aplicarColorAcento(color);
    localStorage.setItem('accentColor', color);

    this.alertService.success(
      'Color de acento actualizado',
      'El color de acento ha sido cambiado correctamente'
    );
  }

  private aplicarColorAcento(color: string): void {
    document.documentElement.style.setProperty('--primary', color);

    // Generar versión más oscura para hover
    const rgb = this.hexToRgb(color);
    if (rgb) {
      const darker = `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)})`;
      document.documentElement.style.setProperty('--primary-dark', darker);
    }
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  restablecerDefecto(): void {
    this.seleccionarTema('light');
    this.seleccionarColorAcento('#3b82f6');
    this.alertService.info(
      'Configuración restablecida',
      'Se han restaurado los valores predeterminados'
    );
  }

  volver(): void {
    this.router.navigate(['/settings']);
  }

  getPreviewClasses(preview: string): string[] {
    const classes = ['preview-box'];
    if (preview === 'light') {
      classes.push('preview-light');
    } else if (preview === 'dark') {
      classes.push('preview-dark');
    } else {
      classes.push(this.temaAplicado === 'dark' ? 'preview-dark' : 'preview-light');
    }
    return classes;
  }
}
