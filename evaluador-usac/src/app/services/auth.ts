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

  //MÉTODOS DE CONTENIDO (FEED)

  getCursos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/cursos`);
  }

  getCatedraticos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/catedraticos`);
  }

  getPublicaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/publicaciones`);
  }

  crearPublicacion(datos: any) {
    return this.http.post(`${this.URL}/publicaciones`, datos);
  }

  // MÉTODOS DE COMENTARIOS

  
  getComentarios(id_publicacion: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/comentarios/${id_publicacion}`);
  }

  crearComentario(datos: any) {
    return this.http.post(`${this.URL}/comentarios`, datos);
  }

  //MÉTODOS DE PERFIL 
  
  obtenerUserPorCarnet(carnet: string): Observable<any> {
    return this.http.get<any>(`${this.URL}/usuario/${carnet}`);
  }

  actualizarPerfil(datos: any) {
    return this.http.put(`${this.URL}/usuario/actualizar`, datos);
  }

  //MÉTODOS DE CURSOS APROBADOS

  getCursosAprobados(registro_academico: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/cursos-aprobados/${registro_academico}`);
  }

  agregarCursoAprobado(datos: any) {
    return this.http.post(`${this.URL}/cursos-aprobados`, datos);
  }

  eliminarCursoAprobado(datos: any) {
    return this.http.post(`${this.URL}/cursos-aprobados/eliminar`, datos);
  }
}