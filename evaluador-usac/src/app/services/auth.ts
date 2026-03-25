import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  registrar(usuario: any) {
    return this.http.post(`${this.URL}/registro`, usuario);
  }


  login(datos: any) {
  // Mandamos 'carnet' y 'password' al servidor
  return this.http.post('http://localhost:3000/api/login', {
    carnet: datos.carnet,
    password: datos.pass 
  });
}

  validarUsuario(datos: any) {
    console.log('🌐 [AuthService] Enviando POST a:', `${this.URL}/validar-usuario`);
    console.log('🌐 [AuthService] Datos:', datos);
    
    return this.http.post(`${this.URL}/validar-usuario`, datos).pipe(
      tap((response) => {
        console.log('🌐 [AuthService] ✅ Respuesta recibida:', response);
      }),
      catchError((error) => {
        console.error('🌐 [AuthService] ❌ Error capturado:', error);
        console.error('🌐 [AuthService] Status:', error.status);
        console.error('🌐 [AuthService] Message:', error.message);
        throw error;
      })
    );
  }

  actualizarPassword(datos: any) {
    console.log('🌐 [AuthService] Enviando POST a:', `${this.URL}/recuperar`);
    console.log('🌐 [AuthService] Datos:', datos);
    
    return this.http.post(`${this.URL}/recuperar`, datos).pipe(
      tap((response) => {
        console.log('🌐 [AuthService] ✅ Respuesta recibida:', response);
      }),
      catchError((error) => {
        console.error('🌐 [AuthService] ❌ Error capturado:', error);
        throw error;
      })
    );
  }
}

