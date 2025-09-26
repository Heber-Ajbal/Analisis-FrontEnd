// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Role = 'cliente' | 'admin_empresa';
export type Tipo = 'cliente' | 'empresa';
export interface User { email:string; role:Role; type:Tipo; approved?:boolean; }

type LoginPayload = { identifier: string; password: string };
type LoginResponse = { jwt: string; user: any };             // lo que muestra tu captura
type MeResponse = {
  id: number;
  email: string;
  username?: string;
  confirmed?: boolean;
  blocked?: boolean;
  provider?: string;
  role?: { id: number; name?: string } | number;             // a veces llega id, a veces objeto
  // ...campos propios: companyId, type, approved, etc.
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private API = environment.apiBaseUrl; // ej. http://localhost:1337
  private ACCESS_KEY = 'app:jwt';

  // === token ===
  get token(): string | null { return localStorage.getItem(this.ACCESS_KEY); }
  private set token(v: string | null) {
    if (v) localStorage.setItem(this.ACCESS_KEY, v);
    else localStorage.removeItem(this.ACCESS_KEY);
  }

  isLoggedIn() { return !!this.token; }
  logout()     { this.token = null; }

  async login(email: string, password: string): Promise<void> {
    const body: LoginPayload = { identifier: email, password };
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.API}/auth/new-local`, body)
    );
    if (!res?.jwt) throw new Error('Login sin token');
    this.token = res.jwt; 
  }
}
