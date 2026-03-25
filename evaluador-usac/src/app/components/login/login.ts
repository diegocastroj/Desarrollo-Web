import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router';
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
    event.preventDefault(); // Evita que la página se recargue

    this.authService.login(this.credenciales).subscribe({
      next: (res: any) => { 
        
        localStorage.setItem('usuario_logueado', JSON.stringify(res.usuario));//para no volver a pedir los datos del usuario cada vez que se recargue la página, se guardan en el localStorage del navegador
        
        this.router.navigate(['/inicio']); // Te manda al Inicio
      },
      error: (err) => {
        alert('❌ Carnet o contraseña incorrectos.');
      }
    });
  }
}