import { Routes } from '@angular/router';

import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { RecuperarPassword } from './components/recuperar-password/recuperar-password';
import { Inicio } from './components/inicio/inicio';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'recuperar', component: RecuperarPassword },
  { path: 'inicio', component: Inicio }
];