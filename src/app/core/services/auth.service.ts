// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Role = 'cliente' | 'admin_empresa';
export type Tipo = 'cliente' | 'empresa';
export interface User { email:string; role:Role; type:Tipo; approved?:boolean; }

export interface AuthSessionUser {
  id: number;
  email: string;
  username?: string;
  role?: unknown;
  [key: string]: unknown;
}

type LoginPayload = { identifier: string; password: string; captchaToken?: string };
type LoginResponse = { jwt: string; user: AuthSessionUser | null | undefined };             // lo que muestra tu captura
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
  private USER_KEY = 'app:user';

  private get storage(): Storage | null {
    try {
      return typeof localStorage === 'undefined' ? null : localStorage;
    } catch {
      return null;
    }
  }

  // === token ===
  get token(): string | null {
    return this.storage?.getItem(this.ACCESS_KEY) ?? null;
  }

  private set token(v: string | null) {
    const storage = this.storage;
    if (!storage) return;
    if (v) storage.setItem(this.ACCESS_KEY, v);
    else storage.removeItem(this.ACCESS_KEY);
  }

  get currentUser(): AuthSessionUser | null {
    const storage = this.storage;
    if (!storage) return null;
    const raw = storage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSessionUser;
    } catch {
      return null;
    }
  }

  get currentUserId(): number | null {
    return this.currentUser?.id ?? null;
  }

  private setCurrentUser(user: AuthSessionUser | null | undefined) {
    const storage = this.storage;
    if (!storage) return;
    if (user) storage.setItem(this.USER_KEY, JSON.stringify(user));
    else storage.removeItem(this.USER_KEY);
  }

  isLoggedIn() { return !!this.token; }
  logout()     { this.token = null; this.setCurrentUser(null); }

  async login(email: string, password: string, captchaToken?: string): Promise<void> {
    const body: LoginPayload = { identifier: email, password };
    if (captchaToken) body.captchaToken = captchaToken;
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.API}/auth/new-local`, body)
    );
    if (!res?.jwt) throw new Error('Login sin token');
    this.token = res.jwt;
    this.setCurrentUser(res.user ?? null);
  }
}
