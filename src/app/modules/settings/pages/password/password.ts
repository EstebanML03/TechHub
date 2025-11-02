import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './password.html',
  styleUrl: './password.css'
})
export class PasswordComponent {
  passwordForm: FormGroup;
  mostrarPasswordActual = false;
  mostrarPasswordNueva = false;
  mostrarPasswordConfirmar = false;
  cargando = false;

  requisitos = [
    { label: 'Al menos 8 caracteres', valido: false, regex: /.{8,}/ },
    { label: 'Una letra mayúscula', valido: false, regex: /[A-Z]/ },
    { label: 'Una letra minúscula', valido: false, regex: /[a-z]/ },
    { label: 'Un número', valido: false, regex: /[0-9]/ },
    { label: 'Un carácter especial (!@#$%^&*)', valido: false, regex: /[!@#$%^&*(),.?":{}|<>]/ }
  ];

  fortaleza = {
    nivel: 0,
    texto: 'Muy débil',
    color: 'danger',
    porcentaje: 0
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertService: AlertService
  ) {
    this.passwordForm = this.fb.group({
      passwordActual: ['', [Validators.required]],
      passwordNueva: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirmar: ['', [Validators.required]]
    }, {
      validators: this.passwordsCoinciden
    });

    // Validar requisitos en tiempo real
    this.passwordForm.get('passwordNueva')?.valueChanges.subscribe(password => {
      this.validarRequisitos(password);
      this.calcularFortaleza(password);
    });
  }

  passwordsCoinciden(form: FormGroup) {
    const nueva = form.get('passwordNueva')?.value;
    const confirmar = form.get('passwordConfirmar')?.value;

    if (nueva && confirmar && nueva !== confirmar) {
      form.get('passwordConfirmar')?.setErrors({ noCoinciden: true });
    } else {
      const errors = form.get('passwordConfirmar')?.errors;
      if (errors) {
        delete errors['noCoinciden'];
        const hasErrors = Object.keys(errors).length > 0;
        form.get('passwordConfirmar')?.setErrors(hasErrors ? errors : null);
      }
    }
    return null;
  }

  validarRequisitos(password: string): void {
    this.requisitos.forEach(requisito => {
      requisito.valido = requisito.regex.test(password);
    });
  }

  calcularFortaleza(password: string): void {
    if (!password) {
      this.fortaleza = { nivel: 0, texto: 'Muy débil', color: 'danger', porcentaje: 0 };
      return;
    }

    let nivel = 0;
    const requisitosValidos = this.requisitos.filter(r => r.valido).length;

    if (password.length >= 8) nivel++;
    if (password.length >= 12) nivel++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) nivel++;
    if (/[0-9]/.test(password)) nivel++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) nivel++;

    const porcentaje = (requisitosValidos / this.requisitos.length) * 100;

    if (nivel <= 1) {
      this.fortaleza = { nivel, texto: 'Muy débil', color: 'danger', porcentaje };
    } else if (nivel === 2) {
      this.fortaleza = { nivel, texto: 'Débil', color: 'warning', porcentaje };
    } else if (nivel === 3) {
      this.fortaleza = { nivel, texto: 'Aceptable', color: 'info', porcentaje };
    } else if (nivel === 4) {
      this.fortaleza = { nivel, texto: 'Fuerte', color: 'success', porcentaje };
    } else {
      this.fortaleza = { nivel, texto: 'Muy fuerte', color: 'success', porcentaje };
    }
  }

  todosRequisitosValidos(): boolean {
    return this.requisitos.every(r => r.valido);
  }

  hasError(campo: string): boolean {
    const control = this.passwordForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(campo: string): string {
    const control = this.passwordForm.get(campo);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['noCoinciden']) return 'Las contraseñas no coinciden';

    return '';
  }

  togglePassword(campo: 'actual' | 'nueva' | 'confirmar'): void {
    switch (campo) {
      case 'actual':
        this.mostrarPasswordActual = !this.mostrarPasswordActual;
        break;
      case 'nueva':
        this.mostrarPasswordNueva = !this.mostrarPasswordNueva;
        break;
      case 'confirmar':
        this.mostrarPasswordConfirmar = !this.mostrarPasswordConfirmar;
        break;
    }
  }

  async cambiarPassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.marcarCamposComoTocados();
      this.alertService.warning(
        'Formulario incompleto',
        'Por favor completa todos los campos correctamente'
      );
      return;
    }

    if (!this.todosRequisitosValidos()) {
      this.alertService.warning(
        'Contraseña no segura',
        'La contraseña debe cumplir con todos los requisitos de seguridad'
      );
      return;
    }

    this.cargando = true;

    // Simular llamada API
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simular validación de contraseña actual
    const passwordActual = this.passwordForm.get('passwordActual')?.value;
    if (passwordActual !== 'password123') { // Simulación
      this.cargando = false;
      this.alertService.error(
        'Contraseña incorrecta',
        'La contraseña actual no es correcta'
      );
      return;
    }

    this.cargando = false;
    this.alertService.success(
      'Contraseña actualizada',
      'Tu contraseña ha sido cambiada exitosamente'
    );

    this.passwordForm.reset();
    this.requisitos.forEach(r => r.valido = false);
    this.fortaleza = { nivel: 0, texto: 'Muy débil', color: 'danger', porcentaje: 0 };
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.passwordForm.controls).forEach(key => {
      this.passwordForm.get(key)?.markAsTouched();
    });
  }

  volver(): void {
    this.router.navigate(['/settings']);
  }

  generarPasswordSegura(): void {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';

    // Asegurar que cumple con todos los requisitos
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Mayúscula
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minúscula
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Número
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Especial

    // Completar hasta 16 caracteres
    for (let i = password.length; i < 16; i++) {
      password += caracteres[Math.floor(Math.random() * caracteres.length)];
    }

    // Mezclar caracteres
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    this.passwordForm.patchValue({
      passwordNueva: password,
      passwordConfirmar: password
    });

    this.alertService.info(
      'Contraseña generada',
      'Se ha generado una contraseña segura. Asegúrate de guardarla en un lugar seguro.'
    );
  }
}
