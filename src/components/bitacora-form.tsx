"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format, parse } from "date-fns"
import { Button } from "../components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import type { BitacoraEntry } from "../types/bitacora"
import { useEffect, useState } from "react"
import { getAllResponsables, getAllCategorias } from "../firebase/responsable-service"
import type { Responsable, Categoria } from "../types/responsable"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  fecha: z.string().min(1, { message: "La fecha es requerida" }),
  fechaEntrega: z.string().min(1, { message: "La fecha de entrega es requerida" }),
  titulo: z.string().min(2, {
    message: "El título debe tener al menos 2 caracteres",
  }),
  descripcion: z.string().min(5, {
    message: "La descripción debe tener al menos 5 caracteres",
  }),
  responsable: z.string({
    required_error: "Por favor seleccione un responsable",
  }),
  categoria: z.string({
    required_error: "Por favor seleccione una categoría",
  }),
  completada: z.boolean().optional(),
})

interface BitacoraFormProps {
  onSubmit: (data: BitacoraEntry) => void
  initialData?: BitacoraEntry
  isEditing?: boolean
}

export default function BitacoraForm({ onSubmit, initialData, isEditing = false }: BitacoraFormProps) {
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  const [responsables, setResponsables] = useState<Responsable[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fecha: format(today, "yyyy-MM-dd"),
      fechaEntrega: format(nextWeek, "yyyy-MM-dd"),
      titulo: "",
      descripcion: "",
      responsable: "",
      categoria: "",
      completada: false,
    },
  })

  // Cargar responsables y categorías desde Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [responsablesData, categoriasData] = await Promise.all([getAllResponsables(), getAllCategorias()])
        setResponsables(responsablesData)
        setCategorias(categoriasData)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Cargar datos iniciales si estamos editando
  useEffect(() => {
    if (initialData && isEditing) {
      form.reset({
        fecha: format(new Date(initialData.fecha), "yyyy-MM-dd"),
        fechaEntrega: format(new Date(initialData.fechaEntrega), "yyyy-MM-dd"),
        titulo: initialData.titulo,
        descripcion: initialData.descripcion,
        responsable: initialData.responsable,
        categoria: initialData.categoria,
        completada: initialData.completada,
      })
    }
  }, [initialData, isEditing, form])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  function handleSubmit(values: z.infer<typeof formSchema>) {
    // Convertir las fechas de string a Date
    const fechaDate = parse(values.fecha, "yyyy-MM-dd", new Date())
    const fechaEntregaDate = parse(values.fechaEntrega, "yyyy-MM-dd", new Date())

    if (isEditing && initialData) {
      onSubmit({
        id: initialData.id,
        ...values,
        fecha: fechaDate,
        fechaEntrega: fechaEntregaDate,
        fechaCreacion: initialData.fechaCreacion,
        completada: values.completada ?? initialData.completada,
      } as BitacoraEntry)
    } else {
      onSubmit({
        id: "",
        ...values,
        fecha: fechaDate,
        fechaEntrega: fechaEntregaDate,
        fechaCreacion: new Date(),
        completada: values.completada ?? false,
      } as BitacoraEntry)
    }

    if (!isEditing) {
      form.reset({
        fecha: format(today, "yyyy-MM-dd"),
        fechaEntrega: format(nextWeek, "yyyy-MM-dd"),
        titulo: "",
        descripcion: "",
        responsable: "",
        categoria: "",
        completada: false,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Fecha del evento <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fechaEntrega"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Fecha de entrega <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Categoría <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="scrollable-dropdown">
                    {categorias.length === 0 ? (
                      <div className="px-2 py-4 text-sm text-gray-500 text-center">
                        No hay categorías disponibles
                      </div>
                    ) : (
                      categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.valor}>
                          {categoria.nombre}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responsable"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Responsable <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un responsable" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="scrollable-dropdown">
                    {responsables.length === 0 ? (
                      <div className="px-2 py-4 text-sm text-gray-500 text-center">
                        No hay responsables disponibles
                      </div>
                    ) : (
                      responsables.map((responsable) => (
                        <SelectItem key={responsable.id} value={responsable.nombre}>
                          {responsable.nombre}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Título <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Título del registro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Descripción <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describa los detalles del evento o actividad"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && (
          <FormField
            control={form.control}
            name="completada"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 mt-1" />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Marcar como completada</FormLabel>
                </div>
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full">
          {isEditing ? "Actualizar Registro" : "Guardar Registro"}
        </Button>
      </form>
    </Form>
  )
}
