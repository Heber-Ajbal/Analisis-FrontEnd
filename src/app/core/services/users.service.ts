import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  mapUserApiToUser,
  User,
  UserApi,
} from '../../models/users/user.model';

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | number | null;
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password'>> & {
  password?: string;
};

interface UsersResponse {
  data?: UserApi[];
  meta?: unknown;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly API = environment.apiBaseUrl;

  async list(opts: { query?: string } = {}): Promise<User[]> {
    let params = new HttpParams();
    if (opts.query) {
      params = params.set('filters[$or][0][username][$containsi]', opts.query)
        .set('filters[$or][1][email][$containsi]', opts.query)
        .set('filters[$or][2][firstName][$containsi]', opts.query)
        .set('filters[$or][3][lastName][$containsi]', opts.query);
    }

    const res = await firstValueFrom(
      this.http.get<UserApi[] | UsersResponse>(`${this.API}/users`, { params })
    );

    const items = Array.isArray(res) ? res : res.data ?? [];
    return items.map(mapUserApiToUser);
  }

  async create(payload: CreateUserPayload): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<UserApi>(`${this.API}/users`, payload)
    );

    return mapUserApiToUser(res);
  }

  async update(id: number, payload: UpdateUserPayload): Promise<User> {
    const res = await firstValueFrom(
      this.http.put<UserApi>(`${this.API}/users/${id}`, payload)
    );

    return mapUserApiToUser(res);
  }

  async findById(id: number | string): Promise<User> {
    const res = await firstValueFrom(
      this.http.get<UserApi | { data: UserApi }>(`${this.API}/users/${id}`)
    );

    const item = (res as any)?.data ?? res;
    if (!item) {
      throw new Error('Usuario no encontrado');
    }

    return mapUserApiToUser(item as UserApi);
  }
}
