import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <--- Importante para los [(ngModel)] del modal
import { AuthService } from '../../services/auth'; // <--- Tu servicio

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit {
  // Datos del Usuario Logueado
  nombreUsuario: string = '';
  carnetUsuario: string = '';

  // Control del Modal y Listas
  mostrarModal: boolean = false;
  cursos: any[] = [];
  catedraticos: any[] = [];
  publicaciones: any[] = []; // Aquí guardaremos las de la DB

  // Objeto para capturar la nueva publicación
  nuevaPost = {
    tipo: 'curso',
    id_curso: null,
    id_catedratico: null,
    mensaje: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // 1. Verificar sesión
    const datos = localStorage.getItem('usuario_logueado');
    if (datos) {
      const user = JSON.parse(datos);
      this.nombreUsuario = user.nombres + ' ' + user.apellidos;
      this.carnetUsuario = user.registro_academico;
    } else {
      this.router.navigate(['/login']);
    }

    // 2. Cargar datos iniciales
    this.cargarDatosIniciales();
    this.obtenerPublicaciones();
  }

  cargarDatosIniciales() {
    this.authService.getCursos().subscribe({
      next: (res) => {
        this.cursos = res;
      },
      error: (err) => {
        alert('Error al cargar los cursos');
      }
    });

    this.authService.getCatedraticos().subscribe({
      next: (res) => {
        this.catedraticos = res;
      },
      error: (err) => {
        alert('Error al cargar los catedráticos');
      }
    });
  }

  obtenerPublicaciones() {
    this.authService.getPublicaciones().subscribe({
      next: (res: any) => {
        this.publicaciones = res; // Guardamos los datos en la variable de la clase
      },
      error: (err) => {
      }
    });
}

  // Funciones del Modal
  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.resetForm();
  }

  resetForm() {
    this.nuevaPost = {
      tipo: 'curso',
      id_curso: null,
      id_catedratico: null,
      mensaje: ''
    };
  }

  // Lógica para enviar la publicación
publicar() {
  // 1. Forzamos la recuperación del carnet justo antes de publicar 
  // por si acaso la variable global falló.
  const datosUser = localStorage.getItem('usuario_logueado');
  if (!datosUser) {
    alert("Sesión expirada. Por favor inicia sesión de nuevo.");
    return;
  }
  
  const usuario = JSON.parse(datosUser);
  const carnetLogueado = usuario.registro_academico; // <--- Verifica que se llame así en tu localStorage

  // 2. Construimos el paquete de datos
  const payload = {
    registro_academico: carnetLogueado, // <--- AQUÍ ESTÁ LA CLAVE
    id_curso: this.nuevaPost.tipo === 'curso' ? this.nuevaPost.id_curso : null,
    id_catedratico: this.nuevaPost.tipo === 'catedratico' ? this.nuevaPost.id_catedratico : null,
    mensaje: this.nuevaPost.mensaje
  };

  console.log('📤 FRONTEND - Enviando publicación:', payload);

  this.authService.crearPublicacion(payload).subscribe({
    next: (res) => {
      alert('¡Publicado con éxito!');
      this.cerrarModal();
      this.obtenerPublicaciones(); // Recargamos el feed
    },
    error: (err) => alert('Error al publicar')
  });
}

  cerrarSesion() {
    localStorage.removeItem('usuario_logueado');
    this.router.navigate(['/login']);
  }
}