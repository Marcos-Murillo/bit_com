"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { toast } from "sonner"
import { UserPlus, Loader2, ArrowLeft } from "lucide-react"
import { createAdmin, getAllAdmins } from "../../firebase/user-service"
import type { User } from "../../types/user"
import { format } from "date-fns"

export default function SuperAdminPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [nombre, setNombre] = useState("")
  const [cedula, setCedula] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [admins, setAdmins] = useState<User[]>([])
  const [loadingAdmins, setLoadingAdmins] = useState(true)

  useEffect(() => {
    if (user?.role !== "superadmin") {
      router.push("/login")
    } else {
      loadAdmins()
    }
  }, [user, router])

  const loadAdmins = async () => {
    try {
      const data = await getAllAdmins()
      setAdmins(data)
    } catch (error) {
      toast.error("Error al cargar administradores")
    } finally {
      setLoadingAdmins(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createAdmin(nombre, cedula, password)
      toast.success("Administrador creado exitosamente")
      setNombre("")
      setCedula("")
      setPassword("")
      loadAdmins()
    } catch (error) {
      toast.error("Error al crear administrador")
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== "superadmin") {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/")} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold">Panel de Super Administrador</h1>
          </div>
          <Button variant="outline" onClick={logout}>
            Cerrar Sesión
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Administrador</CardTitle>
              <CardDescription>Complete el formulario para crear un nuevo administrador</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Nombre completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cedula">
                    Cédula <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cedula"
                    type="text"
                    placeholder="Número de cédula"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Crear Administrador
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Administradores</CardTitle>
              <CardDescription>Administradores registrados en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAdmins ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Cédula</TableHead>
                        <TableHead>Fecha Creación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                            No hay administradores registrados
                          </TableCell>
                        </TableRow>
                      ) : (
                        admins.map((admin) => (
                          <TableRow key={admin.id}>
                            <TableCell className="font-medium">{admin.nombre}</TableCell>
                            <TableCell>{admin.cedula}</TableCell>
                            <TableCell>{format(new Date(admin.fechaCreacion), "dd/MM/yyyy HH:mm")}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
