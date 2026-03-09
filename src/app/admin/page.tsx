"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { toast } from "sonner"
import { Plus, Loader2, ArrowLeft, Trash2 } from "lucide-react"
import {
  createResponsable,
  getAllResponsables,
  deleteResponsable,
  createCategoria,
  getAllCategorias,
  deleteCategoria,
} from "../../firebase/responsable-service"
import type { Responsable, Categoria } from "../../types/responsable"

export default function AdminPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  // Responsables
  const [nombreResponsable, setNombreResponsable] = useState("")
  const [loadingResponsable, setLoadingResponsable] = useState(false)
  const [responsables, setResponsables] = useState<Responsable[]>([])
  const [loadingResponsables, setLoadingResponsables] = useState(true)

  // Categorías
  const [nombreCategoria, setNombreCategoria] = useState("")
  const [loadingCategoria, setLoadingCategoria] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(true)

  useEffect(() => {
    if (!user || user.role === "guest") {
      router.push("/login")
    } else if (user.role === "superadmin") {
      router.push("/superadmin")
    } else {
      loadResponsables()
      loadCategorias()
    }
  }, [user, router])

  const loadResponsables = async () => {
    try {
      const data = await getAllResponsables()
      setResponsables(data)
    } catch (error) {
      toast.error("Error al cargar responsables")
    } finally {
      setLoadingResponsables(false)
    }
  }

  const loadCategorias = async () => {
    try {
      const data = await getAllCategorias()
      setCategorias(data)
    } catch (error) {
      toast.error("Error al cargar categorías")
    } finally {
      setLoadingCategorias(false)
    }
  }

  const handleCreateResponsable = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingResponsable(true)

    try {
      await createResponsable(nombreResponsable)
      toast.success("Responsable creado exitosamente")
      setNombreResponsable("")
      loadResponsables()
    } catch (error) {
      toast.error("Error al crear responsable")
    } finally {
      setLoadingResponsable(false)
    }
  }

  const handleDeleteResponsable = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este responsable?")) return

    try {
      await deleteResponsable(id)
      toast.success("Responsable eliminado")
      loadResponsables()
    } catch (error) {
      toast.error("Error al eliminar responsable")
    }
  }

  const handleCreateCategoria = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingCategoria(true)

    try {
      // Usar el mismo nombre para el valor, convertido a minúsculas y con guiones bajos
      const valor = nombreCategoria.toLowerCase().replace(/\s+/g, "_")
      await createCategoria(nombreCategoria, valor)
      toast.success("Categoría creada exitosamente")
      setNombreCategoria("")
      loadCategorias()
    } catch (error) {
      toast.error("Error al crear categoría")
    } finally {
      setLoadingCategoria(false)
    }
  }

  const handleDeleteCategoria = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta categoría?")) return

    try {
      await deleteCategoria(id)
      toast.success("Categoría eliminada")
      loadCategorias()
    } catch (error) {
      toast.error("Error al eliminar categoría")
    }
  }

  if (!user || user.role !== "admin") {
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
            <h1 className="text-3xl font-bold">Panel de Administrador</h1>
          </div>
          <Button variant="outline" onClick={logout}>
            Cerrar Sesión
          </Button>
        </div>

        <Tabs defaultValue="responsables" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="responsables">Responsables</TabsTrigger>
            <TabsTrigger value="categorias">Categorías</TabsTrigger>
          </TabsList>

          <TabsContent value="responsables">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Crear Responsable</CardTitle>
                  <CardDescription>Agregue un nuevo responsable al sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateResponsable} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombreResponsable">
                        Nombre <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nombreResponsable"
                        type="text"
                        placeholder="Nombre del responsable"
                        value={nombreResponsable}
                        onChange={(e) => setNombreResponsable(e.target.value)}
                        required
                        disabled={loadingResponsable}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loadingResponsable}>
                      {loadingResponsable ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Crear Responsable
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Responsables</CardTitle>
                  <CardDescription>Responsables registrados en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingResponsables ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="w-[100px]">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {responsables.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                                No hay responsables registrados
                              </TableCell>
                            </TableRow>
                          ) : (
                            responsables.map((responsable) => (
                              <TableRow key={responsable.id}>
                                <TableCell className="font-medium">{responsable.nombre}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteResponsable(responsable.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </TableCell>
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
          </TabsContent>

          <TabsContent value="categorias">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Crear Categoría</CardTitle>
                  <CardDescription>Agregue una nueva categoría al sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCategoria} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombreCategoria">
                        Nombre de la Categoría <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nombreCategoria"
                        type="text"
                        placeholder="Ej: CUBRIMIENTO"
                        value={nombreCategoria}
                        onChange={(e) => setNombreCategoria(e.target.value.toUpperCase())}
                        required
                        disabled={loadingCategoria}
                      />
                      <p className="text-xs text-gray-500">
                        Este nombre se mostrará en el formulario de bitácora
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={loadingCategoria}>
                      {loadingCategoria ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Crear Categoría
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Categorías</CardTitle>
                  <CardDescription>Categorías registradas en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingCategorias ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="w-[100px]">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categorias.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                                No hay categorías registradas
                              </TableCell>
                            </TableRow>
                          ) : (
                            categorias.map((categoria) => (
                              <TableRow key={categoria.id}>
                                <TableCell className="font-medium">{categoria.nombre}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCategoria(categoria.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </TableCell>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
