import axios from "axios";

/**
 * Cliente Axios configurado con la URL base de la API.
 * NEXT_PUBLIC_API_URL se define en .env.local (ver README).
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});
