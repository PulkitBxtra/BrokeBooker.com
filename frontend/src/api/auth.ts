import { api } from "./client";
import type { AuthResponse } from "@/types";

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const { data } = await api.post<AuthResponse>("/api/auth/signup", payload);
  return data;
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post<AuthResponse>("/api/auth/login", payload);
  return data;
}
