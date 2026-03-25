import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {
  // Datos del usuario actual logueado
  usuarioLogueado: any = null;
  
  // Datos del perfil que se está visualizando
  carbuscado: string = '';
  perfilData: any = null;
  esPropioPerfil: boolean = false;
  modoEdicion: boolean = false;
  mostrarBusqueda: boolean = false;
  
  // Para edición
  datosEditados = {
    nombres: '',
    apellidos: '',
    correo: ''
  };

  // Cursos Aprobados
  cursosAprobados: any[] = [];
  cursosDisponibles: any[] = [];
  mostrarAgregarCurso: boolean = false;
  cursoSeleccionado: any = null;

  mensaje: string = '';
  tipoMensaje: 'exito' | 'error' | '' = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Obtener usuario logueado
    const datosUser = localStorage.getItem('usuario_logueado');
    if (datosUser) {
      this.usuarioLogueado = JSON.parse(datosUser);
    }

    // Verificar si hay parámetro de carnet en la URL
    this.route.params.subscribe(params => {
      if (params['carnet']) {
        this.carbuscado = params['carnet'];
        this.buscarYCargarPerfil(params['carnet']);
      } else if (this.usuarioLogueado) {
        // Si no hay parámetro, cargar el perfil del usuario actual logueado
        this.buscarYCargarPerfil(this.usuarioLogueado.registro_academico);
      }
    });
  }

  buscarYCargarPerfil(carnet: string) {
    if (!carnet.trim()) {
      this.mostrarMensaje('Ingresa un carnet', 'error');
      return;
    }

    this.authService.obtenerUserPorCarnet(carnet).subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
          this.perfilData = res[0];
          this.esPropioPerfil = this.usuarioLogueado && 
            this.usuarioLogueado.registro_academico === this.perfilData.registro_academico;
          
         
          this.mostrarBusqueda = false;
          
          this.cargarCursosAprobados(carnet);
          
          this.cargarCursosDisponibles();
          
          if (this.esPropioPerfil) {
            this.cargarDatosEdicion();
          }
        } else {
          this.mostrarMensaje('Usuario no encontrado', 'error');
          this.perfilData = null;
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al buscar el usuario', 'error');
      }
    });
  }

  cargarDatosEdicion() {
    this.datosEditados = {
      nombres: this.perfilData.nombres,
      apellidos: this.perfilData.apellidos,
      correo: this.perfilData.correo
    };
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.cargarDatosEdicion();
  }

  activarBusqueda() {
    this.mostrarBusqueda = true;
    this.carbuscado = '';
  }

  guardarCambios() {
    if (!this.datosEditados.nombres.trim() || !this.datosEditados.apellidos.trim() || !this.datosEditados.correo.trim()) {
      this.mostrarMensaje('Todos los campos son obligatorios', 'error');
      return;
    }

    const payload = {
      registro_academico: this.usuarioLogueado.registro_academico,
      nombres: this.datosEditados.nombres,
      apellidos: this.datosEditados.apellidos,
      correo: this.datosEditados.correo
    };

    this.authService.actualizarPerfil(payload).subscribe({
      next: (res) => {
        this.mostrarMensaje('Perfil actualizado exitosamente', 'exito');
        this.modoEdicion = false;
        // Actualizar datos en localStorage
        const usuarioActualizado = { ...this.usuarioLogueado, ...payload };
        localStorage.setItem('usuario_logueado', JSON.stringify(usuarioActualizado));
        this.usuarioLogueado = usuarioActualizado;
        this.perfilData = usuarioActualizado;
      },
      error: (err) => {
        this.mostrarMensaje('Error al actualizar perfil', 'error');
      }
    });
  }

  mostrarMensaje(msg: string, tipo: 'exito' | 'error') {
    this.mensaje = msg;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
      this.tipoMensaje = '';
    }, 3000);
  }

  // Metodos cursos aprobados

  cargarCursosAprobados(carnet: string) {
    this.authService.getCursosAprobados(carnet).subscribe({
      next: (res: any) => {
        this.cursosAprobados = res || [];
      },
      error: (err) => {
        console.error('Error al cargar cursos aprobados', err);
        this.cursosAprobados = [];
      }
    });
  }

  cargarCursosDisponibles() {
    this.authService.getCursos().subscribe({
      next: (res: any) => {
        this.cursosDisponibles = res || [];
      },
      error: (err) => {
        console.error('Error al cargar cursos disponibles', err);
      }
    });
  }

  obtenerTotalCreditos(): number {
    return this.cursosAprobados.reduce((total, curso) => total + (curso.creditos || 0), 0);
  }

  abrirFormularioAgregarCurso() {
    this.mostrarAgregarCurso = true;
    this.cursoSeleccionado = null;
  }

  cerrarFormularioAgregarCurso() {
    this.mostrarAgregarCurso = false;
    this.cursoSeleccionado = null;
  }

  agregarCursoAprobado() {
    if (!this.cursoSeleccionado) {
      this.mostrarMensaje('Selecciona un curso', 'error');
      return;
    }

    // Verificar si ya está aprobado
    const yaExiste = this.cursosAprobados.find(c => c.codigo_curso === this.cursoSeleccionado.codigo_curso);
    if (yaExiste) {
      this.mostrarMensaje('Este curso ya está en tus aprobados', 'error');
      return;
    }

    const payload = {
      registro_academico: this.usuarioLogueado.registro_academico,
      codigo_curso: this.cursoSeleccionado.codigo_curso
    };

    this.authService.agregarCursoAprobado(payload).subscribe({
      next: (res) => {
        this.mostrarMensaje('Curso agregado exitosamente', 'exito');
        this.cargarCursosAprobados(this.usuarioLogueado.registro_academico);
        this.cerrarFormularioAgregarCurso();
      },
      error: (err) => {
        this.mostrarMensaje('Error al agregar curso', 'error');
      }
    });
  }

  eliminarCursoAprobado(codigoCurso: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este curso?')) {
      const payload = {
        registro_academico: this.usuarioLogueado.registro_academico,
        codigo_curso: codigoCurso
      };

      this.authService.eliminarCursoAprobado(payload).subscribe({
        next: (res) => {
          this.mostrarMensaje('Curso eliminado exitosamente', 'exito');
          this.cargarCursosAprobados(this.usuarioLogueado.registro_academico);
        },
        error: (err) => {
          this.mostrarMensaje('Error al eliminar curso', 'error');
        }
      });
    }
  }

  // Obtener cursos disponibles para seleccionar (excluyendo los ya aprobados)
  get cursosParaAgregar() {
    return this.cursosDisponibles.filter(curso => 
      !this.cursosAprobados.find(aprobado => aprobado.codigo_curso === curso.codigo_curso)
    );
  }

  volverAlInicio() {
    this.router.navigate(['/inicio']);
  }
}
