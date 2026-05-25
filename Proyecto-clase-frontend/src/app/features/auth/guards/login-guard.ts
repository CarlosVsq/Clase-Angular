import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

export const loginGuard: CanActivateFn = (route, state) => {
  let authService = inject(Auth);
  let router = inject(Router);
  
  if(!authService.isAutenticated()){
    console.log('No estas autenticado');
    router.navigate(['/login']);
    return false;
  }
  return true;
};
