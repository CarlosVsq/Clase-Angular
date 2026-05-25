import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  public isAutenticated = signal<boolean>(false);

  constructor(){
    this.isAutenticated.set(!!localStorage.getItem('token'));
  }

  private router = inject(Router);

  login(email: string, password: string){
    let userLogin = { email: email, password: password };

    return this.http.post('http://localhost:3000/login', userLogin).pipe(
      map((resp: any) => {
        console.log('Login successful', resp);
        localStorage.setItem('token', resp.token);
        localStorage.setItem('usuario', JSON.stringify(resp.usuario));
        this.isAutenticated.set(true);
        this.router.navigate(['/home']);
      })
    );
  }

  public logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.isAutenticated.set(false);
    this.router.navigate(['/login']);
  }
}
