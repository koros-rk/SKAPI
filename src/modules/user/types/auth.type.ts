export interface GetTokenPayload {
  grant_type: 'credentials' | 'refresh_token';
  email: string;
  username: string;
  password: string;
  refresh_token: string;
}

export interface CredentialsTokenPayload {
  email?: string;
  username?: string;
  password: string;
  salted?: boolean;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  role: string;
}
