"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"
import { toast } from "sonner"
import BitacoraForm from "../components/bitacora-form"
import BitacoraTable from "../components/bitacora-table"
import BitacoraStats from "../components/bitacora-stats"
import BitacoraFilter from "../components/bitacora-filter"
import AsistenciaForm from "../components/asistencia-form"
import AsistenciaTable from "../components/asistencia-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import type { BitacoraEntry } from "../types/bitacora"
import type { AsistenciaEntry } from "../types/asistencia"
import {
  getAllEntries,
  addEntry as addEntryToFirebase,
  toggleEntryComplete,
  getFilteredEntries,
  updateEntry,
} from "../firebase/bitacora-service"
import { getAllAsistencias, addAsistencia } from "../firebase/asistencia-service"
import { getAllResponsables, getAllCategorias } from "../firebase/responsable-service"
import { LogIn, Settings, Shield } from "lucide-react"

export default function BitacoraPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [entries, setEntries] = useState<BitacoraEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<BitacoraEntry[]>([])
  const [asistencias, setAsistencias] = useState<AsistenciaEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAsistencias, setLoadingAsistencias] = useState(true)
  const [responsables, setResponsables] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("entries")
  const [editingEntry, setEditingEntry] = useState<BitacoraEntry | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Determinar permisos según rol
  const isGuest = !user
  const isAdmin = user?.role === "admin"
  const isSuperAdmin = user?.role === "superadmin"
  const hasFullAccess = isAdmin || isSuperAdmin

  useEffect(() => {
    if (!isLoading) {
      fetchData()
      if (hasFullAccess) {
        fetchAsistencias()
      }
    }
  }, [isLoading, hasFullAccess])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [data, responsablesData] = await Promise.all([getAllEntries(), getAllResponsables()])

      setEntries(data)
      setFilteredEntries(data)
      setResponsables(responsablesData.map((r) => r.nombre))
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error("No se pudieron cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const fetchAsistencias = async () => {
    try {
      setLoadingAsistencias(true)
      const data = await getAllAsistencias()
      setAsistencias(data)
    } catch (error) {
      console.error("Error al cargar asistencias:", error)
      toast.error("No se pudieron cargar las asistencias")
    } finally {
      setLoadingAsistencias(false)
    }
  }

  const addEntry = async (entry: Omit<BitacoraEntry, "id">) => {
    try {
      const id = await addEntryToFirebase(entry)

      const newEntry = {
        ...entry,
        id,
      } as BitacoraEntry

      setEntries((prevEntries) => [newEntry, ...prevEntries])
      setFilteredEntries((prevEntries) => [newEntry, ...prevEntries])

      if (!responsables.includes(entry.responsable)) {
        setResponsables((prev) => [...prev, entry.responsable].sort())
      }

      toast.success("Registro añadido correctamente")
    } catch (error) {
      console.error("Error al añadir entrada:", error)
      toast.error("No se pudo añadir el registro")
    }
  }

  const addAsistenciaEntry = async (entry: Omit<AsistenciaEntry, "id">) => {
    try {
      const id = await addAsistencia(entry)

      const newEntry = {
        ...entry,
        id,
      } as AsistenciaEntry

      setAsistencias((prevEntries) => [newEntry, ...prevEntries])

      toast.success("Asistencia registrada correctamente")
    } catch (error) {
      console.error("Error al registrar asistencia:", error)
      toast.error("No se pudo registrar la asistencia")
    }
  }

  const handleToggleComplete = async (id: string) => {
    try {
      const entry = entries.find((e) => e.id === id)
      if (!entry) return

      await toggleEntryComplete(id, !entry.completada)

      const updatedEntries = entries.map((entry) =>
        entry.id === id ? { ...entry, completada: !entry.completada } : entry,
      )

      setEntries(updatedEntries)
      setFilteredEntries((prevFiltered) =>
        prevFiltered.map((entry) => (entry.id === id ? { ...entry, completada: !entry.completada } : entry)),
      )

      toast.success(`Tarea marcada como ${!entry.completada ? "completada" : "pendiente"}`)
    } catch (error) {
      console.error("Error al actualizar entrada:", error)
      toast.error("No se pudo actualizar el estado de la tarea")
    }
  }

  const handleEdit = (entry: BitacoraEntry) => {
    setEditingEntry(entry)
    setIsEditDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false)
    // Pequeño delay para asegurar que el diálogo se cierre completamente
    setTimeout(() => {
      setEditingEntry(null)
    }, 100)
  }

  const handleUpdateEntry = async (updatedEntry: BitacoraEntry) => {
    try {
      await updateEntry(updatedEntry)

      const updatedEntries = entries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))

      setEntries(updatedEntries)
      setFilteredEntries((prevFiltered) =>
        prevFiltered.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)),
      )

      handleCloseDialog()
      toast.success("Registro actualizado correctamente")
    } catch (error) {
      console.error("Error al actualizar entrada:", error)
      toast.error("No se pudo actualizar el registro")
    }
  }

  const isOverdue = (entry: BitacoraEntry) => {
    return !entry.completada && new Date(entry.fechaEntrega) < new Date()
  }

  const handleFilter = async (responsable: string | null, estado: string | null, vencidas: boolean) => {
    try {
      setLoading(true)

      if (!responsable && !estado && !vencidas) {
        setFilteredEntries(entries)
      } else {
        if (entries.length > 0) {
          let filtered = [...entries]

          if (responsable) {
            filtered = filtered.filter((entry) => entry.responsable === responsable)
          }

          if (estado) {
            filtered = filtered.filter((entry) => (estado === "completada" ? entry.completada : !entry.completada))
          }

          if (vencidas) {
            filtered = filtered.filter(isOverdue)
          }

          setFilteredEntries(filtered)
        } else {
          const filtered = await getFilteredEntries(responsable, estado)
          setFilteredEntries(vencidas ? filtered.filter(isOverdue) : filtered)
        }
      }
    } catch (error) {
      console.error("Error al filtrar entradas:", error)
      toast.error("No se pudieron filtrar los registros")
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-6 px-2 flex flex-col min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Sistema de Gestión</h1>
          <div className="flex items-center gap-2">
            {isGuest ? (
              <Button onClick={() => router.push("/login")} variant="outline">
                <LogIn className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </Button>
            ) : (
              <>
                {isSuperAdmin && (
                  <Button onClick={() => router.push("/superadmin")} variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Super Admin
                  </Button>
                )}
                {isAdmin && (
                  <Button onClick={() => router.push("/admin")} variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Administrar
                  </Button>
                )}
                <Button onClick={logout} variant="outline">
                  Cerrar Sesión
                </Button>
              </>
            )}
          </div>
        </div>

        <Tabs
          defaultValue="entries"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-grow flex flex-col"
        >
          <TabsList className={`grid w-full ${hasFullAccess ? "grid-cols-4" : "grid-cols-1"}`}>
            {hasFullAccess && <TabsTrigger value="form">Nuevo Registro</TabsTrigger>}
            <TabsTrigger value="entries">Ver Registros</TabsTrigger>
            {hasFullAccess && <TabsTrigger value="stats">Estadísticas</TabsTrigger>}
            {hasFullAccess && <TabsTrigger value="asistencia">Asistencia</TabsTrigger>}
          </TabsList>

          {hasFullAccess && (
            <TabsContent value="form" className="flex-grow">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Nuevo Registro en Bitácora</CardTitle>
                  <CardDescription>Complete el formulario para añadir un nuevo registro a la bitácora.</CardDescription>
                </CardHeader>
                <CardContent>
                  <BitacoraForm onSubmit={addEntry} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="entries" className="flex-grow">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Registros de la Bitácora</CardTitle>
                <CardDescription>Visualice y filtre los registros guardados en la bitácora.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <BitacoraFilter responsables={responsables} onFilter={handleFilter} />

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="flex-grow">
                    <BitacoraTable
                      entries={filteredEntries}
                      onToggleComplete={hasFullAccess ? handleToggleComplete : undefined}
                      onEdit={hasFullAccess ? handleEdit : undefined}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {hasFullAccess && (
            <TabsContent value="stats" className="flex-grow">
              <Card className="h-full">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <BitacoraStats entries={entries} />
                )}
              </Card>
            </TabsContent>
          )}

          {hasFullAccess && (
            <TabsContent value="asistencia" className="flex-grow">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Registrar Asistencia</CardTitle>
                    <CardDescription>Registre la asistencia seleccionando el nombre, fecha y hora.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AsistenciaForm onSubmit={addAsistenciaEntry} />
                  </CardContent>
                </Card>

                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Registros de Asistencia</CardTitle>
                    <CardDescription>Historial de asistencias registradas.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {loadingAsistencias ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <AsistenciaTable entries={asistencias} />
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Diálogo de edición */}
        {hasFullAccess && (
          <Dialog open={isEditDialogOpen} onOpenChange={handleCloseDialog}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Editar Registro</DialogTitle>
              </DialogHeader>
              {editingEntry && (
                <BitacoraForm onSubmit={handleUpdateEntry} initialData={editingEntry} isEditing={true} />
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
