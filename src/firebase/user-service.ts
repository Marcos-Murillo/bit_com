import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore"
import { db } from "./config"
import type { User } from "../types/user"

const COLLECTION_NAME = "users"

// Convertir datos de Firestore
const convertFromFirestore = (doc: any): User => {
  const data = doc.data()
  return {
    id: doc.id,
    nombre: data.nombre,
    cedula: data.cedula,
    role: data.role,
    fechaCreacion: data.fechaCreacion.toDate(),
  }
}

// Convertir a formato Firestore
const convertToFirestore = (user: Omit<User, "id">) => {
  return {
    nombre: user.nombre,
    cedula: user.cedula,
    role: user.role,
    password: user.password || "",
    fechaCreacion: Timestamp.fromDate(new Date(user.fechaCreacion)),
  }
}

// Crear un nuevo admin
export const createAdmin = async (nombre: string, cedula: string, password: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      nombre,
      cedula,
      password,
      role: "admin",
      fechaCreacion: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error al crear admin:", error)
    throw error
  }
}

// Verificar credenciales de admin
export const verifyAdmin = async (cedula: string, password: string): Promise<User | null> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("cedula", "==", cedula), where("password", "==", password))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    return convertFromFirestore(querySnapshot.docs[0])
  } catch (error) {
    console.error("Error al verificar admin:", error)
    return null
  }
}

// Obtener todos los admins
export const getAllAdmins = async (): Promise<User[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("role", "==", "admin"), orderBy("fechaCreacion", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(convertFromFirestore)
  } catch (error) {
    console.error("Error al obtener admins:", error)
    return []
  }
}
