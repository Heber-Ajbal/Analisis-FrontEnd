// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = environment.strapiToken;

  // Normaliza base del API (sin "/" al final)
  const apiBase = (environment.apiBaseUrl || '').replace(/\/+$/, '');

  // Determina si la petición es para nuestro API
  //   - absoluta:  http://host:1337/api/...
  //   - relativa:  /api/...  o  api/...
  const url = req.url;
  const isApi =
    (apiBase && url.startsWith(apiBase)) ||
    url.startsWith('/api/') ||
    url.startsWith('api/');

  // Evita adjuntar token en endpoints de autenticación
  const isAuthEndpoint =
    /\/api\/auth\/(new-local|login|refresh)\b/.test(url);

  if (!token || !isApi || isAuthEndpoint) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(authReq);
};
