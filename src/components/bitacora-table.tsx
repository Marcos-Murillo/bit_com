"use client"

import { format } from "date-fns"
import { CheckCircle, XCircle, Edit, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import type { BitacoraEntry } from "../types/bitacora"
import { getAllCategorias } from "../firebase/responsable-service"
import type { Categoria } from "../types/responsable"

interface BitacoraTableProps {
  entries: BitacoraEntry[]
  onToggleComplete?: (id: string) => void
  onEdit?: (entry: BitacoraEntry) => void
}

export default function BitacoraTable({ entries, onToggleComplete, onEdit }: BitacoraTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const itemsPerPage = 13
  const totalPages = Math.ceil(entries.length / itemsPerPage)

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
  const showActionsColumn = !!onToggleComplete || !!onEdit

  return (
    <div className="rounded-md border overflow-visible">
      <div className="overflow-x-auto">
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
                  className={isOverdue(entry) ? "bg-red-100" : entry.completada ? "bg-green-50" : "bg-yellow-50"}
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
                    <TableCell className="text-center">
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
    </div>
  )
}
