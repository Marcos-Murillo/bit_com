export type UserRole = "superadmin" | "admin" | "guest"

export interface User {
  id: string
  nombre: string
  cedula: string
  role: UserRole
  password?: string
  fechaCreacion: Date
}

export interface AuthUser {
  cedula: string
  nombre: string
  role: UserRole
}
