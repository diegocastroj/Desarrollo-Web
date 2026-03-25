import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './recuperar-password.html',
  styleUrl: './recuperar-password.css',
})
export class RecuperarPassword {
  // Solo necesitamos estos dos para el primer paso
  recoveryData = {
    carnet: '',
    correo: '',
  };

  constructor(private authService: AuthService, private router: Router) {}

  onRecuperar(event: Event) {
    event.preventDefault();
    
    // Validar que ambos campos estén rellenos
    if (!this.recoveryData.carnet || !this.recoveryData.correo) {
      alert('⚠️ Por favor ingresa el carnet y correo electrónico.');
      return;
    }


    this.authService.validarUsuario(this.recoveryData).subscribe({
      next: (res) => {
        sessionStorage.setItem('carnet_pendiente', this.recoveryData.carnet);
        
        this.router.navigate(['/nueva-password']);
      },
      error: (err) => {
        alert('❌ Los datos no coinciden con nuestros registros. Verifica tu carnet y correo electrónico.');
      }
    });
  }
} 