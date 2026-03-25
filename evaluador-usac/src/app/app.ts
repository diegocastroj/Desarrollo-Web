import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // <--- 2. AGREGALO AQUÍ EN LOS IMPORTS
  templateUrl: './app.html',
  styleUrl: './app.css'
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