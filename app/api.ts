// Se fija al hacer `npm run build`. Para usar el backend local: NEXT_PUBLIC_API_URL=http://localhost:3000
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://backendupbtest-gp4v.onrender.com";

export type Categoria = { id: number; nombre: string; totalProductos: number };

export type Producto = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  categoria: { id: number; nombre: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type Resumen = { total: number; unidades: number; valor: number; agotados: number };

// Hace la petición y lanza el mensaje de error que devuelve el backend ({ error: "..." })
export async function api<T = void>(ruta: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${ruta}`, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
  return data;
}

export const bs = new Intl.NumberFormat("es-BO", { style: "currency", currency: "BOB" });
