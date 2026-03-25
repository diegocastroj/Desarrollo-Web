import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-nueva-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './nueva-password.html',
  styleUrl: './nueva-password.css',
})
export class NuevaPassword {
  passData = { nuevaPass: '', confirmarPass: '' };

  constructor(private authService: AuthService, private router: Router) {}

  onCambiarPassword(event: Event) {
    event.preventDefault();
    
    // Recuperamos el carnet que guardamos en el paso anterior
    const carnet = sessionStorage.getItem('carnet_pendiente');

    if (!carnet) {
      alert('❌ Error: Debes validar tu identidad primero');
      this.router.navigate(['/recuperar']);
      return;
    }

    if (!this.passData.nuevaPass || !this.passData.confirmarPass) {
      alert('⚠️ Por favor completa ambos campos de contraseña');
      return;
    }

    if (this.passData.nuevaPass !== this.passData.confirmarPass) {
      alert('⚠️ Las contraseñas no coinciden'); 
      return;
    }

    if (this.passData.nuevaPass.length < 6) {
      alert('⚠️ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Enviamos el carnet y la nueva pass al servidor para el UPDATE
    this.authService.actualizarPassword({ carnet, nuevaPass: this.passData.nuevaPass }).subscribe({
      next: (res) => {
        alert('✅ Contraseña actualizada con éxito');
        sessionStorage.removeItem('carnet_pendiente'); // Limpiamos la memoria
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert('❌ Error al actualizar la contraseña. Intenta nuevamente.');
      }
    });
  }
}