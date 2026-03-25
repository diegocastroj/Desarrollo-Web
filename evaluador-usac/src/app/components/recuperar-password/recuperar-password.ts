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

    console.log('📤 Enviando datos:', this.recoveryData);

    // 1. Llamamos a una función de validación en el servicio
    this.authService.validarUsuario(this.recoveryData).subscribe({
      next: (res) => {
        console.log('✅ Validación exitosa en el cliente. Respuesta:', res);
        // 2. Si es válido, guardamos el carnet temporalmente
        sessionStorage.setItem('carnet_pendiente', this.recoveryData.carnet);
        console.log('✅ Carnet guardado en sessionStorage:', this.recoveryData.carnet);
        
        // 3. Saltamos a la pantalla de la nueva contraseña
        console.log('🔄 Intentando navegar a /nueva-password');
        console.log('Rutas disponibles:', this.router.config);
        this.router.navigate(['nueva-password']);
        
      }
      
    });
  }
} 