export interface RequestUser {
  iat: number;
  exp: number;
  sub: number;
  email: string;
  usernameId: string;
}

export interface RTUser {
  refreshToken: string;
  iat: number;
  exp: number;
  sub: number;
  email: string;
  usernameId: string;
}
