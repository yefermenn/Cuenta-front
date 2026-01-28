import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario, LoginRequest, LoginResponse } from '../models/index';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public usuario$ = this.usuarioSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor() {
    this.loadStoredSession();
  }

  private loadStoredSession(): void {
    const token = localStorage.getItem('auth_token');
    const usuario = localStorage.getItem('auth_usuario');
    
    if (token && usuario) {
      this.tokenSubject.next(token);
      this.usuarioSubject.next(JSON.parse(usuario));
    }
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    // Simular login - en producción sería una llamada HTTP
    return new Observable((observer) => {
      setTimeout(() => {
        const response: LoginResponse = {
          token: 'token_' + Date.now(),
          usuario: {
            id: '1',
            nombre: 'Juan Pérez',
            email: request.email,
          },
        };

        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_usuario', JSON.stringify(response.usuario));
        
        this.tokenSubject.next(response.token);
        this.usuarioSubject.next(response.usuario);

        observer.next(response);
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_usuario');
    this.tokenSubject.next(null);
    this.usuarioSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  getCurrentUser(): Usuario | null {
    return this.usuarioSubject.value;
  }
}
