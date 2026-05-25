import { apiRequest } from "@/shared/api/client";
import type { Role, User } from "@/entities/user/types";

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiRequest<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  register: (payload: RegisterPayload) =>
    apiRequest<TokenResponse>("/api/v1/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  logout: (refreshToken: string) =>
    apiRequest<void>("/api/v1/auth/logout", {
      method: "POST",
      body: { refreshToken },
      auth: false,
    }),

  me: () => apiRequest<User>("/api/v1/users/me", { method: "GET" }),
};
