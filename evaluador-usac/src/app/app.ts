import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App implements OnInit { 
  http = inject(HttpClient); // telefono para hacer llamadas HTTP
  
  // Creamos la lista vacía
  listaCatedraticos: any[] = []; 

  // La llamada a tu servidor Node.js
  ngOnInit() {
    this.http.get('http://localhost:3000/api/catedraticos').subscribe((datos: any) => {
      this.listaCatedraticos = datos; 
    });
  }
}