"use client";

import { useEffect, useState } from "react";

// Se fija al hacer `npm run build`. Para usar el backend local: NEXT_PUBLIC_API_URL=http://localhost:3000
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://backendupbtest-gp4v.onrender.com";

type Producto = { id: number; nombre: string; precio: number; stock: number; createdAt: string };
type Form = { nombre: string; precio: string; stock: string };

const formVacio: Form = { nombre: "", precio: "", stock: "" };

// Hace la petición y lanza el mensaje de error que devuelve el backend ({ error: "..." })
async function api<T>(ruta: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api/productos${ruta}`, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
  return data;
}

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [soloAgotados, setSoloAgotados] = useState(false);
  const [form, setForm] = useState<Form>(formVacio);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargar(nombre = busqueda, agotados = soloAgotados) {
    setCargando(true);
    setError("");
    try {
      const ruta = agotados ? "/agotados" : nombre ? `?nombre=${encodeURIComponent(nombre)}` : "";
      setProductos(await api<Producto[]>(ruta));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  // Carga inicial (cargando ya empieza en true)
  useEffect(() => {
    api<Producto[]>("")
      .then(setProductos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const body = JSON.stringify({
      nombre: form.nombre,
      precio: form.precio === "" ? undefined : Number(form.precio),
      stock: form.stock === "" ? undefined : Number(form.stock),
    });
    try {
      if (editandoId) await api(`/${editandoId}`, { method: "PUT", body });
      else await api("", { method: "POST", body });
      cancelar();
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function eliminar(p: Producto) {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    try {
      await api(`/${p.id}`, { method: "DELETE" });
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function editar(p: Producto) {
    setEditandoId(p.id);
    setForm({ nombre: p.nombre, precio: String(p.precio), stock: String(p.stock) });
  }

  function cancelar() {
    setEditandoId(null);
    setForm(formVacio);
  }

  const input = "rounded-lg border border-zinc-300 bg-background px-3 py-2 dark:border-zinc-700";
  const boton = "rounded-lg px-4 py-2 font-medium transition-opacity hover:opacity-80";

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <form onSubmit={guardar} className="grid gap-3 rounded-2xl bg-zinc-50 p-5 sm:grid-cols-[2fr_1fr_1fr_auto] dark:bg-zinc-900">
        <input className={input} placeholder="Nombre" value={form.nombre} required={!editandoId}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        <input className={input} placeholder="Precio" type="number" min="0" step="0.01" value={form.precio}
          onChange={(e) => setForm({ ...form, precio: e.target.value })} />
        <input className={input} placeholder="Stock" type="number" min="0" step="1" value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <div className="flex gap-2">
          <button className={`${boton} bg-foreground text-background`}>{editandoId ? "Guardar" : "Crear"}</button>
          {editandoId && <button type="button" onClick={cancelar} className={`${boton} border border-zinc-300 dark:border-zinc-700`}>Cancelar</button>}
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setSoloAgotados(false); cargar(busqueda, false); }} className="flex flex-1 gap-2">
          <input className={`${input} flex-1`} placeholder="Buscar por nombre…" value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)} />
          <button className={`${boton} border border-zinc-300 dark:border-zinc-700`}>Buscar</button>
        </form>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={soloAgotados}
            onChange={(e) => { setSoloAgotados(e.target.checked); cargar(busqueda, e.target.checked); }} />
          Solo agotados
        </label>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-100 px-4 py-3 text-red-800 dark:bg-red-950 dark:text-red-200">{error}</p>}

      {cargando ? (
        <p className="text-zinc-500">Cargando… (si el backend en Render estaba dormido puede tardar hasta un minuto)</p>
      ) : productos.length === 0 ? (
        <p className="text-zinc-500">No hay productos.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-200 text-sm text-zinc-500 dark:border-zinc-800">
              <tr><th className="py-2">ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th></th></tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-3">{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>Bs {p.precio.toFixed(2)}</td>
                  <td className={p.stock === 0 ? "font-semibold text-red-600" : ""}>{p.stock === 0 ? "Agotado" : p.stock}</td>
                  <td className="flex justify-end gap-2 py-2">
                    <button onClick={() => editar(p)} className="text-sm underline">Editar</button>
                    <button onClick={() => eliminar(p)} className="text-sm text-red-600 underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-zinc-500">API: {API_URL}</p>
    </section>
  );
}
