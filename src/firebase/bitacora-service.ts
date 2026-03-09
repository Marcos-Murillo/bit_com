import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  where,
  type QueryConstraint,
} from "firebase/firestore"
import { toast } from "sonner"
import { db } from "./config"
import type { BitacoraEntry } from "../types/bitacora"
import { convertFromFirestore, convertToFirestore } from "../utils/firebase-helpers"

// Colección de Firestore
const COLLECTION_NAME = "bitacora_entries"

// Obtener todas las entradas
export const getAllEntries = async (): Promise<BitacoraEntry[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("fechaCreacion", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(convertFromFirestore)
  } catch (error) {
    console.error("Error al obtener entradas:", error)
    toast.error("No se pudieron cargar los registros de la bitácora")
    return []
  }
}

// Filtrar entradas por responsable y/o estado
export const getFilteredEntries = async (
  responsable: string | null,
  estado: string | null,
): Promise<BitacoraEntry[]> => {
  try {
    const constraints: QueryConstraint[] = []

    // Añadir filtros si están presentes
    if (responsable) {
      constraints.push(where("responsable", "==", responsable))
    }

    if (estado) {
      // Si el estado es "completada", buscamos completada=true
      // Si el estado es "pendiente", buscamos completada=false
      constraints.push(where("completada", "==", estado === "completada"))
    }

    // Siempre ordenar por fecha de creación descendente
    constraints.push(orderBy("fechaCreacion", "desc"))

    const q = query(collection(db, COLLECTION_NAME), ...constraints)
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(convertFromFirestore)
  } catch (error) {
    console.error("Error al filtrar entradas:", error)
    toast.error("No se pudieron filtrar los registros")
    return []
  }
}

// Filtrar entradas por período de tiempo
export const getEntriesByTimeFilter = async (
  timeFilter: "day" | "week" | "month" | "all",
): Promise<BitacoraEntry[]> => {
  try {
    if (timeFilter === "all") {
      return getAllEntries()
    }

    const now = new Date()
    let startDate = new Date()

    if (timeFilter === "day") {
      startDate.setHours(0, 0, 0, 0)
    } else if (timeFilter === "week") {
      const day = startDate.getDay()
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1) // Ajustar al lunes
      startDate = new Date(startDate.setDate(diff))
      startDate.setHours(0, 0, 0, 0)
    } else if (timeFilter === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const q = query(
      collection(db, COLLECTION_NAME),
      where("fecha", ">=", Timestamp.fromDate(startDate)),
      where("fecha", "<=", Timestamp.fromDate(now)),
      orderBy("fecha", "desc"),
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(convertFromFirestore)
  } catch (error) {
    console.error("Error al filtrar entradas:", error)
    toast.error("No se pudieron filtrar los registros de la bitácora")
    return []
  }
}

// Añadir una nueva entrada
export const addEntry = async (entry: Omit<BitacoraEntry, "id">): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), convertToFirestore(entry as BitacoraEntry))
    toast.success("Registro añadido correctamente")
    return docRef.id
  } catch (error) {
    console.error("Error al añadir entrada:", error)
    toast.error("No se pudo añadir el registro")
    throw error
  }
}

// Actualizar el estado de completado de una entrada
export const toggleEntryComplete = async (id: string, completada: boolean): Promise<void> => {
  try {
    const entryRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(entryRef, {
      completada: completada,
    })
    toast.success(`Tarea marcada como ${completada ? "completada" : "pendiente"}`)
  } catch (error) {
    console.error("Error al actualizar entrada:", error)
    toast.error("No se pudo actualizar el estado de la tarea")
    throw error
  }
}

// Actualizar una entrada completa
export const updateEntry = async (entry: BitacoraEntry): Promise<void> => {
  try {
    const entryRef = doc(db, COLLECTION_NAME, entry.id)
    await updateDoc(entryRef, convertToFirestore(entry))
    toast.success("Registro actualizado correctamente")
  } catch (error) {
    console.error("Error al actualizar entrada:", error)
    toast.error("No se pudo actualizar el registro")
    throw error
  }
}

// Eliminar una entrada
export const deleteEntry = async (id: string): Promise<void> => {
  try {
    const entryRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(entryRef)
    toast.success("Registro eliminado correctamente")
  } catch (error) {
    console.error("Error al eliminar entrada:", error)
    toast.error("No se pudo eliminar el registro")
    throw error
  }
}

// Obtener todos los responsables únicos
export const getUniqueResponsables = async (): Promise<string[]> => {
  try {
    const entries = await getAllEntries()
    const responsables = new Set<string>()

    entries.forEach((entry: BitacoraEntry) => {
      responsables.add(entry.responsable)
    })

    return Array.from(responsables).sort()
  } catch (error) {
    console.error("Error al obtener responsables:", error)
    return []
  }
}

// Actualizar la función getUniqueCategorias para incluir las nuevas categorías
export const getUniqueCategorias = async (): Promise<Record<string, string>> => {
  try {
    const entries = await getAllEntries()
    const categorias = new Set<string>()

    entries.forEach((entry: BitacoraEntry) => {
      categorias.add(entry.categoria)
    })

    const categoriasMap: Record<string, string> = {}
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
    }

    // Primero añadir las categorías de la base de datos
    Array.from(categorias).forEach((cat) => {
      categoriasMap[cat] = labels[cat as keyof typeof labels] || cat
    })

    // Luego añadir todas las categorías predefinidas que no estén ya en la base de datos
    Object.keys(labels).forEach((key) => {
      if (!categoriasMap[key]) {
        categoriasMap[key] = labels[key]
      }
    })

    return categoriasMap
  } catch (error) {
    console.error("Error al obtener categorías:", error)

    // En caso de error, devolver al menos las categorías predefinidas
    return {
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
    }
  }
}
