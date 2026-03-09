import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore"
import { db } from "./config"
import type { Responsable, Categoria } from "../types/responsable"

const RESPONSABLES_COLLECTION = "responsables"
const CATEGORIAS_COLLECTION = "categorias"

// Responsables
export const createResponsable = async (nombre: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, RESPONSABLES_COLLECTION), {
      nombre,
      fechaCreacion: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error al crear responsable:", error)
    throw error
  }
}

export const getAllResponsables = async (): Promise<Responsable[]> => {
  try {
    const q = query(collection(db, RESPONSABLES_COLLECTION), orderBy("nombre", "asc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nombre: doc.data().nombre,
      fechaCreacion: doc.data().fechaCreacion.toDate(),
    }))
  } catch (error) {
    console.error("Error al obtener responsables:", error)
    return []
  }
}

export const deleteResponsable = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, RESPONSABLES_COLLECTION, id))
  } catch (error) {
    console.error("Error al eliminar responsable:", error)
    throw error
  }
}

// Categorías
export const createCategoria = async (nombre: string, valor: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, CATEGORIAS_COLLECTION), {
      nombre,
      valor,
      fechaCreacion: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error al crear categoría:", error)
    throw error
  }
}

export const getAllCategorias = async (): Promise<Categoria[]> => {
  try {
    const q = query(collection(db, CATEGORIAS_COLLECTION), orderBy("nombre", "asc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nombre: doc.data().nombre,
      valor: doc.data().valor,
      fechaCreacion: doc.data().fechaCreacion.toDate(),
    }))
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    return []
  }
}

export const deleteCategoria = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, CATEGORIAS_COLLECTION, id))
  } catch (error) {
    console.error("Error al eliminar categoría:", error)
    throw error
  }
}
