const features = [
  {
    title: "Rápido",
    text: "Sitio estático generado con Next.js y servido desde la CDN de Firebase.",
  },
  {
    title: "Automático",
    text: "Cada push a main construye y publica el sitio con GitHub Actions.",
  },
  {
    title: "Simple",
    text: "Sin servidor que mantener: solo HTML, CSS y un poco de JavaScript.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold">MiProyecto</span>
        <a href="#contacto" className="text-sm text-zinc-600 hover:text-foreground dark:text-zinc-400">
          Contacto
        </a>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Lanza tu idea a la web en minutos
          </h1>
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Una landing page simple hecha con Next.js, desplegada en Firebase Hosting.
          </p>
          <a
            href="#features"
            className="rounded-full bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-80"
          >
            Ver más
          </a>
        </section>

        <section id="features" className="bg-zinc-50 py-20 dark:bg-zinc-900">
          <div className="mx-auto grid w-full max-w-5xl gap-6 px-6 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl bg-background p-6 shadow-sm">
                <h2 className="mb-2 text-xl font-semibold">{f.title}</h2>
                <p className="text-zinc-600 dark:text-zinc-400">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contacto" className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-6 py-20 text-center">
          <h2 className="text-3xl font-bold">¿Hablamos?</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Escríbeme y te respondo pronto.</p>
          <a
            href="mailto:alancadena1@upb.edu"
            className="rounded-full border border-zinc-300 px-6 py-3 font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Enviar correo
          </a>
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} MiProyecto
      </footer>
    </div>
  );
}
