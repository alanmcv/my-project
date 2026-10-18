"use client";

import { useEffect, useRef, useState } from "react";
import { api, type Categoria, type Producto } from "./api";
import { botonPrimario, botonSecundario, campo, dialogo, IconoCerrar } from "./ui";

type Props = {
  producto: Producto | null; // null = crear uno nuevo
  categorias: Categoria[];
  onClose: () => void;
  onGuardado: (mensaje: string) => void;
};

export default function ProductoForm({ producto, categorias, onClose, onGuardado }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState({
    nombre: producto?.nombre ?? "",
    descripcion: producto?.descripcion ?? "",
    precio: producto ? String(producto.precio) : "",
    stock: producto ? String(producto.stock) : "",
    categoriaId: producto?.categoria ? String(producto.categoria.id) : "",
  });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  // <dialog> nativo: showModal() bloquea el fondo y cierra con Esc. Luego se enfoca el primer campo.
  useEffect(() => {
    if (!ref.current?.open) ref.current?.showModal();
    ref.current?.querySelector("input")?.focus();
  }, []);

  const cambiar = (clave: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [clave]: e.target.value });

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    const body = JSON.stringify({
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: form.precio === "" ? 0 : Number(form.precio),
      stock: form.stock === "" ? 0 : Number(form.stock),
      categoriaId: form.categoriaId ? Number(form.categoriaId) : null,
    });
    try {
      if (producto) await api(`/productos/${producto.id}`, { method: "PUT", body });
      else await api("/productos", { method: "POST", body });
      onGuardado(producto ? "Producto actualizado" : "Producto creado");
    } catch (e) {
      setError((e as Error).message);
      setGuardando(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()} // clic fuera del cuadro
      className={dialogo}
      aria-labelledby="titulo-producto"
    >
      <form onSubmit={guardar} className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h2 id="titulo-producto" className="text-lg font-semibold">
            {producto ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Cerrar" className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <IconoCerrar className="size-5" />
          </button>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Nombre
          <input className={campo} value={form.nombre} onChange={cambiar("nombre")} required maxLength={100} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Descripción <span className="sr-only">(opcional)</span>
          <textarea className={`${campo} min-h-20 resize-y`} value={form.descripcion} onChange={cambiar("descripcion")} maxLength={500} placeholder="Opcional" />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Precio (Bs)
            <input className={campo} type="number" min="0" step="0.01" value={form.precio} onChange={cambiar("precio")} placeholder="0.00" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Stock
            <input className={campo} type="number" min="0" step="1" value={form.stock} onChange={cambiar("stock")} placeholder="0" />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Categoría
          <select className={campo} value={form.categoriaId} onChange={cambiar("categoriaId")}>
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </label>

        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={() => ref.current?.close()} className={botonSecundario}>Cancelar</button>
          <button className={botonPrimario} disabled={guardando}>
            {guardando ? "Guardando…" : producto ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
