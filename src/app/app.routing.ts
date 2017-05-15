import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { RouteController } from '../services/route.controller.service';


export const routes: Routes = [
  { path: 'login', redirectTo: 'login' },
  // { path: '', redirectTo: 'pages', canActivate: [RouteController] },
  { path: '**', redirectTo: 'pages/dashboard' }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, { useHash: true });
