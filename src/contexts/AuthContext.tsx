"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import type { AuthUser, UserRole } from "../types/user"

interface AuthContextType {
  user: AuthUser | null
  login: (cedula: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem("authUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (cedula: string, password: string): Promise<boolean> => {
    // Super Admin hardcoded
    if (cedula === "1007260358" && password === "romanos812") {
      const superAdmin: AuthUser = {
        cedula: "1007260358",
        nombre: "Super Administrador",
        role: "superadmin",
      }
      setUser(superAdmin)
      localStorage.setItem("authUser", JSON.stringify(superAdmin))
      return true
    }

    // Verificar admins en Firebase
    try {
      const { verifyAdmin } = await import("../firebase/user-service")
      const admin = await verifyAdmin(cedula, password)
      if (admin) {
        const authUser: AuthUser = {
          cedula: admin.cedula,
          nombre: admin.nombre,
          role: "admin",
        }
        setUser(authUser)
        localStorage.setItem("authUser", JSON.stringify(authUser))
        return true
      }
    } catch (error) {
      console.error("Error al verificar admin:", error)
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("authUser")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
