import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // --- MÉTODOS DE USUARIO ---

  registrar(usuario: any) {
    return this.http.post(`${this.URL}/registro`, usuario);
  }

  login(datos: any) {
    return this.http.post(`${this.URL}/login`, {
      carnet: datos.carnet,
      password: datos.pass 
    });
  }

  validarUsuario(datos: any) {
    return this.http.post(`${this.URL}/validar-usuario`, datos);
  }

  actualizarPassword(datos: any) {
    return this.http.post(`${this.URL}/recuperar`, datos);
  }

  // --- MÉTODOS DE CONTENIDO (FEED) ---

  // Obtener todos los cursos para el select
  getCursos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/cursos`);
  }

  // Obtener todos los catedráticos para el select
  getCatedraticos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/catedraticos`);
  }

  // Obtener el feed de publicaciones
  getPublicaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/publicaciones`);
  }

  // Enviar la nueva publicación
  crearPublicacion(datos: any) {
    return this.http.post(`${this.URL}/publicaciones`, datos);
  }

  // --- MÉTODOS DE COMENTARIOS ---

  // Obtener comentarios de una publicación
  getComentarios(id_publicacion: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/comentarios/${id_publicacion}`);
  }

  // Crear un nuevo comentario
  crearComentario(datos: any) {
    return this.http.post(`${this.URL}/comentarios`, datos);
  }

  // --- MÉTODOS DE PERFIL ---

  // Obtener usuario por carnet
  obtenerUserPorCarnet(carnet: string): Observable<any> {
    return this.http.get<any>(`${this.URL}/usuario/${carnet}`);
  }

  // Actualizar datos del perfil propio
  actualizarPerfil(datos: any) {
    return this.http.put(`${this.URL}/usuario/actualizar`, datos);
  }

  // --- MÉTODOS DE CURSOS APROBADOS ---

  // Obtener cursos aprobados de un usuario
  getCursosAprobados(registro_academico: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/cursos-aprobados/${registro_academico}`);
  }

  // Agregar un curso aprobado
  agregarCursoAprobado(datos: any) {
    return this.http.post(`${this.URL}/cursos-aprobados`, datos);
  }

  // Eliminar un curso aprobado
  eliminarCursoAprobado(datos: any) {
    return this.http.post(`${this.URL}/cursos-aprobados/eliminar`, datos);
  }
} // <--- Asegúrate de que esta llave cierre AL FINAL de todo