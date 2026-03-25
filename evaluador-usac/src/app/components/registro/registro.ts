import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  // Estos nombres deben coincidir con los de tu tabla de MySQL
  userData = {
    carnet: '',
    nombres: '',
    apellidos: '',
    correo: '',
    pass: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(event: Event) {
    event.preventDefault();
    this.authService.registrar(this.userData).subscribe({
      next: (res) => {
        alert('¡Usuario registrado con éxito!');
        this.router.navigate(['/login']); // Te manda al login tras registrarte
      },
      error: (err) => alert('Error: El carnet ya existe o faltan datos')
    });
  }
}