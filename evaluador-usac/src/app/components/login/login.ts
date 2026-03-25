import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <--- ¡IMPORTANTE!
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink], // <--- Verifica que estén aquí
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  // Este objeto debe llamarse igual que en el HTML
  credenciales = {
    carnet: '',
    pass: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  // Cambiamos el nombre de la función para que coincida con tu (ngSubmit)
  onSubmit(event: Event) {
    event.preventDefault(); // Evita que la página se recargue

    this.authService.login(this.credenciales).subscribe({
      next: (res: any) => {
        // Guardamos los datos del usuario en el navegador
        localStorage.setItem('usuario_logueado', JSON.stringify(res.usuario));
        
        this.router.navigate(['/inicio']); // Te manda al Inicio
      },
      error: (err) => {
        console.error(err);
        alert('❌ Carnet o contraseña incorrectos.');
      }
    });
  }
}