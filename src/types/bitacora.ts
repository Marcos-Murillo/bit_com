export interface BitacoraEntry {
  id: string
  fecha: Date
  fechaEntrega: Date
  titulo: string
  descripcion: string
  responsable: string
  categoria: string
  estado?: string
  fechaCreacion: Date
  completada: boolean
}

  