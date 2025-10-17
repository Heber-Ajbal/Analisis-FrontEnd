export interface UserRoleApi {
  id: number;
  name?: string;
}

export interface UserApi {
  id: number;
  documentId: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: number | UserRoleApi | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface User {
  id: number;
  documentId: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  roleId?: number | null;
  roleName?: string | null;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}

export const mapUserApiToUser = (api: UserApi): User => ({
  id: api.id,
  documentId: api.documentId,
  provider: api.provider,
  confirmed: api.confirmed,
  blocked: api.blocked,
  username: api.username,
  email: api.email,
  firstName: api.firstName ?? null,
  lastName: api.lastName ?? null,
  roleId:
    typeof api.role === 'number'
      ? api.role
      : typeof api.role === 'object' && api.role
        ? api.role.id
        : null,
  roleName:
    typeof api.role === 'object' && api.role
      ? api.role.name ?? null
      : null,
  fullName: `${api.firstName ?? ''} ${api.lastName ?? ''}`.trim(),
  createdAt: new Date(api.createdAt),
  updatedAt: new Date(api.updatedAt),
  publishedAt: new Date(api.publishedAt),
});
