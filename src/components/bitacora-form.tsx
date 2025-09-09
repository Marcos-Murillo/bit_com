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
import { useEffect } from "react"

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
                    <SelectItem value="capacitacion">CAPACITACION</SelectItem>
                    <SelectItem value="convocatoria">CONVOCATORIA</SelectItem>
                    <SelectItem value="correo_electronico">CORREO ELECTRONICO</SelectItem>
                    <SelectItem value="estadistica_participacion">ESTISTICA DE PARTICIPACION</SelectItem>
                    <SelectItem value="eventos">EVENTOS</SelectItem>
                    <SelectItem value="formulario">FORMULARIO</SelectItem>
                    <SelectItem value="informe">INFORME</SelectItem>
                    <SelectItem value="ofimatica">OFIMATICA</SelectItem>
                    <SelectItem value="participacion">PARTICIPACION</SelectItem>
                    <SelectItem value="prestamo">PRESTAMO</SelectItem>
                    <SelectItem value="prestamo_equipos_sonido">PRESTAMO DE EQUIPOS DE SONIDO</SelectItem>
                    <SelectItem value="propuesta">PROPUESTA</SelectItem>
                    <SelectItem value="publicacion_redes">PUBLICACION EN REDES SOCIALES</SelectItem>
                    <SelectItem value="reunion">REUNION</SelectItem>
                    <SelectItem value="solicitud">SOLICITUD</SelectItem>
                    <SelectItem value="tareas_bodega">TAREAS DE BODEGA</SelectItem>
                    <SelectItem value="tareas_oficina">TAREAS GENERALES DE OFICINA</SelectItem>
                    <SelectItem value="uniformes">UNIFORMES</SelectItem>
                    <SelectItem value="ficha_tecnica">FICHA TECNICA</SelectItem>
                    <SelectItem value="estudio_de_mercado">ESTUDIO DE MERCADO</SelectItem>
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
                    <SelectItem value="LAURA MOURE">LAURA MOURE</SelectItem>
                    <SelectItem value="XIMENA">XIMENA</SelectItem>
                    <SelectItem value="LAURA CECILIA">LAURA CECILIA</SelectItem>
                    <SelectItem value="PATIÑO">PATIÑO</SelectItem>
                    <SelectItem value="JUAN QUINTERO">JUAN QUINTERO</SelectItem>
                    <SelectItem value="DANIEL">DANIEL</SelectItem>
                    <SelectItem value="SERGIO CASAS">SERGIO CASAS</SelectItem>
                    <SelectItem value="SANTIAGO GUZMAN">SANTIAGO GUZMAN</SelectItem>
                    <SelectItem value="GISSEL">GISSEL</SelectItem>
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
