"use client";

import { useEffect, useRef, useState } from "react";
import { api, type Categoria } from "./api";
import { botonPrimario, campo, dialogo, IconoBorrar, IconoCerrar, IconoEditar } from "./ui";

type Props = {
  categorias: Categoria[];
  onClose: () => void;
  onCambio: (mensaje: string) => void; // el padre recarga los datos y muestra el aviso
};

export default function CategoriasDialog({ categorias, onClose, onCambio }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ref.current?.open) ref.current?.showModal();
  }, []);

  // Ejecuta una petición y devuelve true si salió bien
  async function ejecutar(peticion: Promise<unknown>, mensaje: string) {
    setError("");
    try {
      await peticion;
      onCambio(mensaje);
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    const ok = await ejecutar(api("/categorias", { method: "POST", body: JSON.stringify({ nombre }) }), "Categoría creada");
    if (ok) setNombre("");
  }

  function renombrar(c: Categoria) {
    const nuevo = prompt("Nuevo nombre de la categoría", c.nombre);
    if (nuevo && nuevo !== c.nombre) {
      ejecutar(api(`/categorias/${c.id}`, { method: "PUT", body: JSON.stringify({ nombre: nuevo }) }), "Categoría renombrada");
    }
  }

  function eliminar(c: Categoria) {
    const aviso = c.totalProductos ? `\nSus ${c.totalProductos} producto(s) quedarán sin categoría.` : "";
    if (confirm(`¿Eliminar la categoría "${c.nombre}"?${aviso}`)) {
      ejecutar(api(`/categorias/${c.id}`, { method: "DELETE" }), "Categoría eliminada");
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      className={dialogo}
      aria-labelledby="titulo-categorias"
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h2 id="titulo-categorias" className="text-lg font-semibold">Categorías</h2>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Cerrar" className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <IconoCerrar className="size-5" />
          </button>
        </div>

        <form onSubmit={crear} className="flex gap-2">
          <input className={`${campo} min-w-0 flex-1`} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nueva categoría" maxLength={50} required aria-label="Nombre de la nueva categoría" />
          <button className={botonPrimario}>Agregar</button>
        </form>

        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}

        <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {categorias.length === 0 && <li className="px-4 py-6 text-center text-sm text-zinc-500">Aún no hay categorías.</li>}
          {categorias.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{c.nombre}</p>
                <p className="text-xs text-zinc-500">{c.totalProductos} producto{c.totalProductos === 1 ? "" : "s"}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => renombrar(c)} aria-label={`Renombrar ${c.nombre}`} className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800">
                  <IconoEditar />
                </button>
                <button onClick={() => eliminar(c)} aria-label={`Eliminar ${c.nombre}`} className="rounded-md p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                  <IconoBorrar />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
