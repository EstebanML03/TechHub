import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent {
  mostrarLogin = true;

  constructor(private router: Router) {}

  cambiarFormulario() {
    this.mostrarLogin = !this.mostrarLogin;
  }

  iniciarSesion() {
    // Aquí puedes agregar validación real
    this.router.navigate(['/home']);
  }

  registrar() {
    // Simula registro y redirección
    this.router.navigate(['/home']);
  }
}
