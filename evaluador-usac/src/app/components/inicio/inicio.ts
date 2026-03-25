import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inicio',
  standalone: true,
  template: `
    <div style="padding: 50px; text-align: center;">
      <h1>Bienvenido al Sistema, {{ nombreUsuario }}</h1>
      <p>Has iniciado sesión correctamente con el carnet {{ carnetUsuario }}</p>
      <button (click)="cerrarSesion()">Cerrar Sesión</button>
    </div>
  `
})
export class Inicio implements OnInit {
  nombreUsuario: string = '';
  carnetUsuario: string = '';

  ngOnInit() {
    // Recuperamos los datos que guardamos en el login
    const datos = localStorage.getItem('usuario_logueado');
    if (datos) {
      const user = JSON.parse(datos);
      this.nombreUsuario = user.nombres + ' ' + user.apellidos;
      this.carnetUsuario = user.registro_academico;
    }
  }

  cerrarSesion() {
    localStorage.removeItem('usuario_logueado');
    window.location.href = '/login';
  }
}