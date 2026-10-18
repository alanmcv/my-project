import { API_URL } from "./api";
import Inventario from "./productos";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      <main className="flex flex-1 flex-col">
        <Inventario />
      </main>

      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
        <p>Frontend: Next.js en Firebase Hosting · Backend: Express + PostgreSQL en Render</p>
        <p className="mt-1 font-mono">API: {API_URL}</p>
      </footer>
    </div>
  );
}
