"use client";

import { useEffect, useRef, useState } from "react";
import { api, bs, type Categoria, type Producto, type Resumen } from "./api";
import CategoriasDialog from "./categorias-dialog";
import ProductoForm from "./producto-form";
import {
  botonPrimario, botonSecundario, campo,
  IconoAlerta, IconoBorrar, IconoBuscar, IconoCaja, IconoCapas, IconoDinero, IconoEditar, IconoEtiqueta, IconoMas,
} from "./ui";

type Filtros = { nombre: string; categoria: string; agotados: boolean };
const sinFiltros: Filtros = { nombre: "", categoria: "", agotados: false };

export default function Inventario() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [filtros, setFiltros] = useState<Filtros>(sinFiltros);
  const [version, setVersion] = useState(0); // se incrementa para volver a pedir los datos
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [error, setError] = useState("");
  const [formulario, setFormulario] = useState<{ producto: Producto | null } | null>(null);
  const [verCategorias, setVerCategorias] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);
  const timerAviso = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Pide productos (con filtros), resumen y categorías. Espera 250 ms para no disparar
  // una petición por cada tecla en el buscador, y descarta respuestas viejas.
  useEffect(() => {
    let vigente = true;
    const params = new URLSearchParams();
    if (filtros.nombre.trim()) params.set("nombre", filtros.nombre.trim());
    if (filtros.categoria) params.set("categoria", filtros.categoria);
    const query = params.toString();
    const ruta = `/productos${filtros.agotados ? "/agotados" : ""}${query ? `?${query}` : ""}`;

    const timer = setTimeout(() => {
      Promise.all([api<Producto[]>(ruta), api<Resumen>("/productos/resumen"), api<Categoria[]>("/categorias")])
        .then(([p, r, c]) => {
          if (!vigente) return;
          setProductos(p);
          setResumen(r);
          setCategorias(c);
          setEstado("listo");
        })
        .catch((e) => {
          if (!vigente) return;
          setError(e.message);
          setEstado("error");
        });
    }, 250);

    return () => {
      vigente = false;
      clearTimeout(timer);
    };
  }, [filtros, version]);

  const recargar = () => setVersion((v) => v + 1);

  function avisar(texto: string, tipo: "ok" | "error" = "ok") {
    clearTimeout(timerAviso.current);
    setAviso({ texto, tipo });
    timerAviso.current = setTimeout(() => setAviso(null), 3000);
  }

  async function eliminar(p: Producto) {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    try {
      await api(`/productos/${p.id}`, { method: "DELETE" });
      avisar("Producto eliminado");
      recargar();
    } catch (e) {
      avisar((e as Error).message, "error");
    }
  }

  const hayFiltros = filtros.nombre !== "" || filtros.categoria !== "" || filtros.agotados;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      {/* Encabezado */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <IconoCaja className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
            <p className="text-sm text-zinc-500">Gestión de productos y categorías</p>
          </div>
        </div>
        <EstadoApi estado={estado} />
      </header>

      {/* Estadísticas */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumen del inventario">
        <Tarjeta titulo="Productos" valor={resumen?.total} icono={<IconoCaja />} color="indigo" />
        <Tarjeta titulo="Unidades en stock" valor={resumen?.unidades} icono={<IconoCapas />} color="sky" />
        <Tarjeta titulo="Valor del inventario" valor={resumen && bs.format(resumen.valor)} icono={<IconoDinero />} color="emerald" />
        <Tarjeta
          titulo="Agotados"
          valor={resumen?.agotados}
          icono={<IconoAlerta />}
          color={resumen?.agotados ? "red" : "zinc"}
          onClick={() => setFiltros({ ...filtros, agotados: !filtros.agotados })}
          activa={filtros.agotados}
        />
      </section>

      {/* Tabla con filtros */}
      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800">
          <div className="relative min-w-48 flex-1">
            <IconoBuscar className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              className={`${campo} w-full pl-9`}
              placeholder="Buscar por nombre…"
              value={filtros.nombre}
              onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
              aria-label="Buscar por nombre"
            />
          </div>
          <select
            className={campo}
            value={filtros.categoria}
            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <button
            onClick={() => setFiltros({ ...filtros, agotados: !filtros.agotados })}
            aria-pressed={filtros.agotados}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              filtros.agotados
                ? "border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
                : "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            }`}
          >
            Solo agotados
          </button>
          <div className="flex gap-2 sm:ml-auto">
            <button onClick={() => setVerCategorias(true)} className={botonSecundario}>
              <IconoEtiqueta /> Categorías
            </button>
            <button onClick={() => setFormulario({ producto: null })} className={botonPrimario}>
              <IconoMas /> Nuevo producto
            </button>
          </div>
        </div>

        {estado === "error" ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="font-medium text-red-600 dark:text-red-400">No se pudo conectar con la API</p>
            <p className="text-sm text-zinc-500">{error}</p>
            <button onClick={recargar} className={botonSecundario}>Reintentar</button>
          </div>
        ) : estado === "cargando" ? (
          <Esqueleto />
        ) : productos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <IconoCaja className="size-10 text-zinc-300 dark:text-zinc-700" />
            <p className="font-medium">{hayFiltros ? "Ningún producto coincide con los filtros" : "Aún no hay productos"}</p>
            {hayFiltros ? (
              <button onClick={() => setFiltros(sinFiltros)} className={botonSecundario}>Limpiar filtros</button>
            ) : (
              <button onClick={() => setFormulario({ producto: null })} className={botonPrimario}><IconoMas /> Crear el primero</button>
            )}
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs tracking-wide text-zinc-500 uppercase dark:bg-zinc-900/60">
                <tr>
                  <th className="px-3 py-3 sm:px-4 font-medium">Producto</th>
                  <th className="hidden px-3 py-3 sm:px-4 font-medium md:table-cell">Categoría</th>
                  <th className="px-3 py-3 sm:px-4 text-right font-medium">Precio</th>
                  <th className="px-3 py-3 sm:px-4 font-medium">Stock</th>
                  <th className="px-3 py-3 sm:px-4"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {productos.map((p) => (
                  <tr key={p.id} className="transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-3 py-3 sm:px-4">
                      <p className="font-medium">{p.nombre}</p>
                      {p.descripcion && <p className="max-w-40 truncate text-xs text-zinc-500 sm:max-w-xs">{p.descripcion}</p>}
                      {/* En celular la categoría va debajo del nombre en vez de en su propia columna */}
                      {p.categoria && <p className="mt-0.5 text-xs text-indigo-600 md:hidden dark:text-indigo-300">{p.categoria.nombre}</p>}
                    </td>
                    <td className="hidden px-3 py-3 sm:px-4 md:table-cell">
                      {p.categoria ? (
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                          {p.categoria.nombre}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">Sin categoría</span>
                      )}
                    </td>
                    <td className="px-3 py-3 sm:px-4 text-right font-medium whitespace-nowrap tabular-nums">{bs.format(p.precio)}</td>
                    <td className="px-3 py-3 sm:px-4"><EstadoStock stock={p.stock} /></td>
                    <td className="px-3 py-3 sm:px-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setFormulario({ producto: p })} aria-label={`Editar ${p.nombre}`} className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800">
                          <IconoEditar />
                        </button>
                        <button onClick={() => eliminar(p)} aria-label={`Eliminar ${p.nombre}`} className="rounded-md p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                          <IconoBorrar />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {formulario && (
        <ProductoForm
          producto={formulario.producto}
          categorias={categorias}
          onClose={() => setFormulario(null)}
          onGuardado={(mensaje) => {
            setFormulario(null);
            avisar(mensaje);
            recargar();
          }}
        />
      )}

      {verCategorias && (
        <CategoriasDialog
          categorias={categorias}
          onClose={() => setVerCategorias(false)}
          onCambio={(mensaje) => {
            avisar(mensaje);
            recargar();
          }}
        />
      )}

      {aviso && (
        <div
          role="status"
          className={`fixed right-4 bottom-4 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
            aviso.tipo === "ok" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {aviso.texto}
        </div>
      )}
    </div>
  );
}

function EstadoApi({ estado }: { estado: "cargando" | "listo" | "error" }) {
  const estilos = {
    cargando: ["bg-amber-500 animate-pulse", "Conectando con la API…"],
    listo: ["bg-emerald-500", "API en línea"],
    error: ["bg-red-500", "API sin conexión"],
  }[estado];
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-zinc-800 dark:bg-zinc-900">
      <span className={`size-2 rounded-full ${estilos[0]}`} />
      {estilos[1]}
    </span>
  );
}

const colores = {
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  red: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300",
  zinc: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

type TarjetaProps = {
  titulo: string;
  valor: React.ReactNode;
  icono: React.ReactNode;
  color: keyof typeof colores;
  onClick?: () => void;
  activa?: boolean;
};

function Tarjeta({ titulo, valor, icono, color, onClick, activa }: TarjetaProps) {
  const contenido = (
    <>
      <div className={`hidden size-9 shrink-0 place-items-center rounded-lg sm:grid ${colores[color]}`}>{icono}</div>
      <div className="min-w-0 text-left">
        <p className="truncate text-xs text-zinc-500">{titulo}</p>
        <p className="truncate text-lg font-semibold tabular-nums sm:text-xl">
          {valor ?? <span className="inline-block h-6 w-12 animate-pulse rounded bg-zinc-200 align-middle dark:bg-zinc-800" />}
        </p>
      </div>
    </>
  );
  const clase = `flex min-w-0 items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm sm:p-4 dark:bg-zinc-900 ${
    activa ? "border-red-300 ring-2 ring-red-500/20 dark:border-red-500/40" : "border-zinc-200 dark:border-zinc-800"
  }`;
  return onClick ? (
    <button onClick={onClick} aria-pressed={activa} className={`${clase} transition hover:border-zinc-300 dark:hover:border-zinc-700`}>
      {contenido}
    </button>
  ) : (
    <div className={clase}>{contenido}</div>
  );
}

function EstadoStock({ stock }: { stock: number }) {
  // En celular se muestra la versión corta ("3 · Bajo", "80") para que la tabla quepa
  const [clase, texto]: [string, React.ReactNode] =
    stock === 0
      ? ["bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300", "Agotado"]
      : stock < 5
        ? ["bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300", <>{stock} · <span className="hidden sm:inline">Stock </span>bajo</>]
        : ["bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", <>{stock}<span className="hidden sm:inline"> unidades</span></>];
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${clase}`}>{texto}</span>;
}

function Esqueleto() {
  return (
    <div className="flex flex-col gap-3 p-4" aria-busy="true">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      ))}
      <p className="pt-2 text-center text-xs text-zinc-500">
        Si el backend en Render estaba dormido, la primera carga puede tardar hasta un minuto.
      </p>
    </div>
  );
}
