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
  textoBusqueda: string = '';
  carnetBusqueda: string = '';
  filtroCurso: string = '';
  filtroCatedratico: string = '';

  // Control del Modal y Listas
  mostrarModal: boolean = false;
  mostrarComentarios: boolean = false;
  id_publicacion_comentarios: number | null = null;
  
  cursos: any[] = [];
  catedraticos: any[] = [];
  publicaciones: any[] = []; // Aquí guardaremos las de la DB
  comentarios: any[] = []; // Para almacenar comentarios de la publicación

  // Objeto para capturar la nueva publicación
  nuevaPost = {
    tipo: 'curso',
    id_curso: null,
    id_catedratico: null,
    mensaje: ''
  };

  // Objeto para capturar el nuevo comentario
  nuevoComentario = {
    texto: ''
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

  this.authService.crearPublicacion(payload).subscribe({
    next: (res) => {
      alert('¡Publicado con éxito!');
      this.cerrarModal();
      this.obtenerPublicaciones(); // Recargamos el feed
    },
    error: (err) => alert('Error al publicar')
  });
  }

  get publicacionesFiltradas() {
    return this.publicaciones.filter(post => {
      // Filtro de texto (Buscador) - busca en nombres, apellidos y nombre del curso/catedrático
      const nombreCompleto = (post.nombres + ' ' + post.apellidos).toLowerCase();
      const objetivo = (post.nombre_curso || post.nombre_catedratico || '').toLowerCase();
      const coincideTexto = !this.textoBusqueda || 
        nombreCompleto.includes(this.textoBusqueda.toLowerCase()) ||
        objetivo.includes(this.textoBusqueda.toLowerCase());

      // Filtro por Curso
      const coincideCurso = !this.filtroCurso || post.id_curso == this.filtroCurso;
      
      // Filtro por Catedrático
      const coincideCatedratico = !this.filtroCatedratico || post.id_catedratico == this.filtroCatedratico;

      return coincideTexto && coincideCurso && coincideCatedratico;
    });
  }

  // --- MÉTODOS DE COMENTARIOS ---

  abrirComentarios(id_publicacion: number) {
    this.id_publicacion_comentarios = id_publicacion;
    this.mostrarComentarios = true;
    this.cargarComentarios(id_publicacion);
  }

  cerrarComentarios() {
    this.mostrarComentarios = false;
    this.id_publicacion_comentarios = null;
    this.comentarios = [];
    this.resetFormComentario();
  }

  cargarComentarios(id_publicacion: number) {
    this.authService.getComentarios(id_publicacion).subscribe({
      next: (res: any) => {
        this.comentarios = res;
      },
      error: (err) => {
      }
    });
  }

  agregarComentario() {
    if (!this.nuevoComentario.texto.trim()) {
      alert('El comentario no puede estar vacío');
      return;
    }

    const datosUser = localStorage.getItem('usuario_logueado');
    if (!datosUser) {
      alert("Sesión expirada. Por favor inicia sesión de nuevo.");
      return;
    }

    const usuario = JSON.parse(datosUser);

    const payload = {
      id_publicacion: this.id_publicacion_comentarios,
      registro_academico: usuario.registro_academico,
      texto_comentario: this.nuevoComentario.texto
    };

    this.authService.crearComentario(payload).subscribe({
      next: (res) => {
        this.resetFormComentario();
        this.cargarComentarios(this.id_publicacion_comentarios!); // Recargamos los comentarios
      },
      error: (err) => alert('Error al agregar comentario')
    });
  }

  resetFormComentario() {
    this.nuevoComentario = {
      texto: ''
    };
  }

  // Buscar usuario por carnet
  buscarUsuario(carnet: string) {
    if (!carnet.trim()) {
      alert('Ingresa un carnet');
      return;
    }
    this.router.navigate(['/perfil', carnet]);
  }

  cerrarSesion() {
    localStorage.removeItem('usuario_logueado');
    this.router.navigate(['/login']);
  }


}