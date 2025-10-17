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
  fullName: `${api.firstName ?? ''} ${api.lastName ?? ''}`.trim(),
  createdAt: new Date(api.createdAt),
  updatedAt: new Date(api.updatedAt),
  publishedAt: new Date(api.publishedAt),
});
