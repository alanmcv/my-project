import Productos from "./productos";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      <header className="mx-auto w-full max-w-5xl px-6 pt-8">
        <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Frontend en Firebase Hosting · Backend en Render</p>
      </header>

      <main className="flex flex-1 flex-col">
        <Productos />
      </main>

      <footer className="py-6 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} MiProyecto
      </footer>
    </div>
  );
}
