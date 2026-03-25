import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink], 
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  credenciales = {
    carnet: '',
    pass: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(event: Event) {
    event.preventDefault();
    
    if (!this.credenciales.carnet || !this.credenciales.pass) {
      alert('⚠️ Por favor ingresa carnet y contraseña.');
      return;
    }

    console.log('📤 [LoginComponent] Enviando credenciales');

    this.authService.login(this.credenciales).subscribe({
      next: (res) => {
        console.log('📱 [LoginComponent] ✅ Respuesta recibida en el cliente:', res);
        alert('¡Bienvenido!');
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        console.error('📱 [LoginComponent] ❌ Error en login:', err);
        alert('❌ Los datos no coinciden con nuestros registros.');
      },
      complete: () => {
        console.log('📱 [LoginComponent] ✅ Observable completado');
      }
    });
  }
}