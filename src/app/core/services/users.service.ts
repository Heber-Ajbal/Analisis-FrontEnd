import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { mapUserApiToUser, User, UserApi } from '../../models/users/user.model';

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
}
