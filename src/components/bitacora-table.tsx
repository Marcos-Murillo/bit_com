"use client"

import { format } from "date-fns"
import { CheckCircle, XCircle, Edit, ChevronLeft, ChevronRight, MoreVertical, Trash2, Eye } from "lucide-react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Card, CardContent } from "../components/ui/card"
import { useState, useEffect } from "react"
import type { BitacoraEntry } from "../types/bitacora"
import { getAllCategorias } from "../firebase/responsable-service"
import type { Categoria } from "../types/responsable"

interface BitacoraTableProps {
  entries: BitacoraEntry[]
  onToggleComplete?: (id: string) => void
  onEdit?: (entry: BitacoraEntry) => void
  onDelete?: (id: string) => void
}

export default function BitacoraTable({ entries, onToggleComplete, onEdit, onDelete }: BitacoraTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [selectedEntry, setSelectedEntry] = useState<BitacoraEntry | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const itemsPerPage = 13
  const totalPages = Math.ceil(entries.length / itemsPerPage)

  // Determinar si el usuario tiene permisos (si tiene acciones disponibles)
  const hasActions = !!onToggleComplete || !!onEdit || !!onDelete
  const isGuestMode = !hasActions

  // Cargar categorías desde Firebase
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const data = await getAllCategorias()
        setCategorias(data)
      } catch (error) {
        console.error("Error al cargar categorías:", error)
      }
    }

    loadCategorias()
  }, [])

  const handleRowClick = (entry: BitacoraEntry) => {
    if (isGuestMode) {
      setSelectedEntry(entry)
      setIsDetailDialogOpen(true)
    }
  }

  // Obtener entradas para la página actual
  const getCurrentEntries = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return entries.slice(startIndex, endIndex)
  }

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      capacitacion: "bg-blue-500 hover:bg-blue-600",
      convocatoria: "bg-purple-500 hover:bg-purple-600",
      correo_electronico: "bg-teal-500 hover:bg-teal-600",
      estadistica_participacion: "bg-indigo-500 hover:bg-indigo-600",
      eventos: "bg-yellow-500 hover:bg-yellow-600",
      formulario: "bg-pink-500 hover:bg-pink-600",
      informe: "bg-orange-500 hover:bg-orange-600",
      ofimatica: "bg-cyan-500 hover:bg-cyan-600",
      participacion: "bg-emerald-500 hover:bg-emerald-600",
      prestamo: "bg-violet-500 hover:bg-violet-600",
      prestamo_equipos_sonido: "bg-fuchsia-500 hover:bg-fuchsia-600",
      propuesta: "bg-amber-500 hover:bg-amber-600",
      publicacion_redes: "bg-lime-500 hover:bg-lime-600",
      reunion: "bg-green-500 hover:bg-green-600",
      solicitud: "bg-rose-500 hover:bg-rose-600",
      tareas_bodega: "bg-sky-500 hover:bg-sky-600",
      tareas_oficina: "bg-slate-500 hover:bg-slate-600",
      uniformes: "bg-red-500 hover:bg-red-600",
    }

    return styles[category] || "bg-gray-500 hover:bg-gray-600"
  }

  const getCategoryLabel = (category: string) => {
    // Buscar en las categorías cargadas desde Firebase
    const categoriaEncontrada = categorias.find((cat) => cat.valor === category)
    if (categoriaEncontrada) {
      return categoriaEncontrada.nombre
    }

    // Fallback a las categorías hardcoded si no se encuentra
    const labels: Record<string, string> = {
      capacitacion: "CAPACITACION",
      convocatoria: "CONVOCATORIA",
      correo_electronico: "CORREO ELECTRONICO",
      estadistica_participacion: "ESTISTICA DE PARTICIPACION",
      eventos: "EVENTOS",
      formulario: "FORMULARIO",
      informe: "INFORME",
      ofimatica: "OFIMATICA",
      participacion: "PARTICIPACION",
      prestamo: "PRESTAMO",
      prestamo_equipos_sonido: "PRESTAMO DE EQUIPOS DE SONIDO",
      propuesta: "PROPUESTA",
      publicacion_redes: "PUBLICACION EN REDES SOCIALES",
      reunion: "REUNION",
      solicitud: "SOLICITUD",
      tareas_bodega: "TAREAS DE BODEGA",
      tareas_oficina: "TAREAS GENERALES DE OFICINA",
      uniformes: "UNIFORMES",
      cubrimiento: "CUBRIMIENTO",
      edicion: "EDICION",
      grabacion: "GRABACION",
      dibujo: "DIBUJO",
      guion: "GUION",
      publicaciones: "PUBLICACIONES",
      transmiciones: "TRANSMICIONES",
    }

    return labels[category] || category.toUpperCase()
  }

  // Verificar si una tarea está vencida (fecha de entrega pasada y no completada)
  const isOverdue = (entry: BitacoraEntry) => {
    return !entry.completada && new Date(entry.fechaEntrega) < new Date()
  }

  // Determinar si mostrar la columna de acciones
  const showActionsColumn = !!onToggleComplete || !!onEdit || !!onDelete

  return (
    <div className="rounded-md border overflow-visible">
      {/* Vista Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableCaption>Lista de registros en la bitácora</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Fecha</TableHead>
              <TableHead className="w-[100px]">Entrega</TableHead>
              <TableHead className="w-[250px]">Título</TableHead>
              <TableHead className="w-[180px]">Responsable</TableHead>
              <TableHead className="w-[150px]">Categoría</TableHead>
              <TableHead className="w-[120px]">Estado</TableHead>
              {showActionsColumn && <TableHead className="w-[80px] text-center">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {getCurrentEntries().length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showActionsColumn ? 7 : 6}
                  className="text-center py-6 text-muted-foreground"
                >
                  No hay registros que coincidan con los filtros aplicados
                </TableCell>
              </TableRow>
            ) : (
              getCurrentEntries().map((entry) => (
                <TableRow
                  key={entry.id}
                  className={`${isOverdue(entry) ? "bg-red-100" : entry.completada ? "bg-green-50" : "bg-yellow-50"} ${isGuestMode ? "cursor-pointer hover:bg-gray-100" : ""}`}
                  onClick={() => isGuestMode && handleRowClick(entry)}
                >
                  <TableCell className="whitespace-nowrap">{format(new Date(entry.fecha), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(entry.fechaEntrega), "dd/MM/yyyy")}
                    {isOverdue(entry) && (
                      <Badge variant="destructive" className="ml-2">
                        Vencida
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium truncate max-w-[250px]" title={entry.titulo}>
                      {entry.titulo}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 truncate max-w-[250px]" title={entry.descripcion}>
                      {entry.descripcion}
                    </div>
                  </TableCell>
                  <TableCell className="truncate max-w-[180px]" title={entry.responsable}>
                    {entry.responsable}
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryBadge(entry.categoria)}>{getCategoryLabel(entry.categoria)}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {entry.completada ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="mr-1 h-4 w-4" /> Completada
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <XCircle className="mr-1 h-4 w-4" /> Pendiente
                      </span>
                    )}
                  </TableCell>
                  {showActionsColumn && (
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            type="button"
                            aria-label="Abrir menú de acciones"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48" sideOffset={5}>
                          {onEdit && (
                            <DropdownMenuItem 
                              onSelect={() => onEdit(entry)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {onToggleComplete && (
                            <DropdownMenuItem 
                              onSelect={() => onToggleComplete(entry.id)}
                            >
                              {entry.completada ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Marcar pendiente
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marcar completada
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem 
                              onSelect={() => onDelete(entry.id)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vista Mobile - Compacta */}
      <div className="md:hidden">
        <div className="divide-y">
          {getCurrentEntries().length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay registros que coincidan con los filtros aplicados
            </div>
          ) : (
            getCurrentEntries().map((entry) => (
              <div
                key={entry.id}
                className={`p-3 ${isOverdue(entry) ? "bg-red-50" : entry.completada ? "bg-green-50" : "bg-yellow-50"} ${isGuestMode ? "cursor-pointer active:bg-gray-100" : ""}`}
                onClick={() => isGuestMode && handleRowClick(entry)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {entry.completada ? (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      )}
                      <h3 className="font-medium text-sm truncate">{entry.titulo}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <span>{format(new Date(entry.fechaEntrega), "dd/MM/yyyy")}</span>
                      <span>•</span>
                      <span className="truncate">{entry.responsable}</span>
                    </div>
                    <Badge className={`${getCategoryBadge(entry.categoria)} text-xs`}>
                      {getCategoryLabel(entry.categoria)}
                    </Badge>
                  </div>
                  {showActionsColumn && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-200 focus:outline-none"
                            type="button"
                            aria-label="Abrir menú de acciones"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48" sideOffset={5}>
                          {onEdit && (
                            <DropdownMenuItem onSelect={() => onEdit(entry)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {onToggleComplete && (
                            <DropdownMenuItem onSelect={() => onToggleComplete(entry.id)}>
                              {entry.completada ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Marcar pendiente
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marcar completada
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem 
                              onSelect={() => onDelete(entry.id)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                  {isGuestMode && (
                    <Eye className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Paginación */}
      {entries.length > itemsPerPage && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{" "}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, entries.length)}</span> de{" "}
                <span className="font-medium">{entries.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-md"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-r-md"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de detalles para usuarios sin permisos */}
      {isGuestMode && selectedEntry && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Detalles del Registro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Título</label>
                    <p className="text-base font-semibold">{selectedEntry.titulo}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Descripción</label>
                    <p className="text-sm">{selectedEntry.descripcion}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fecha del Evento</label>
                      <p className="text-sm">{format(new Date(selectedEntry.fecha), "dd/MM/yyyy")}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fecha de Entrega</label>
                      <p className="text-sm">{format(new Date(selectedEntry.fechaEntrega), "dd/MM/yyyy")}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Responsable</label>
                    <p className="text-sm">{selectedEntry.responsable}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Categoría</label>
                    <div className="mt-1">
                      <Badge className={getCategoryBadge(selectedEntry.categoria)}>
                        {getCategoryLabel(selectedEntry.categoria)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <div className="mt-1">
                      {selectedEntry.completada ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completada
                        </Badge>
                      ) : isOverdue(selectedEntry) ? (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Vencida
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pendiente
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
                    <p className="text-sm">{format(new Date(selectedEntry.fechaCreacion), "dd/MM/yyyy HH:mm")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
