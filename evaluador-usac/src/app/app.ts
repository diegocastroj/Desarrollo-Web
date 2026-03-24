import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html', // <-- 1. Corregido al nombre exacto de tu HTML
  styleUrl: './app.css'      // <-- 2. Corregido al nombre exacto de tu CSS
})
export class App implements OnInit { // <-- 3. Le regresamos el nombre a "App" para que main.ts no se enoje
  // Preparamos el "teléfono"
  http = inject(HttpClient); 
  
  // Creamos la lista vacía
  listaCatedraticos: any[] = []; 

  // La llamada a tu servidor Node.js
  ngOnInit() {
    this.http.get('http://localhost:3000/api/catedraticos').subscribe((datos: any) => {
      this.listaCatedraticos = datos; 
    });
  }
}