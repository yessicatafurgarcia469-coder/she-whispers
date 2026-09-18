import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, Lock, MessagesSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Círculo de Ellas — Comunidad privada para mujeres" },
      {
        name: "description",
        content:
          "Un espacio cálido y privado donde las mujeres comparten historias, consejos y apoyo, con opción de publicar de forma anónima.",
      },
      { property: "og:title", content: "Círculo de Ellas — Comunidad privada para mujeres" },
      {
        property: "og:description",
        content:
          "Un espacio cálido y privado donde las mujeres comparten historias, consejos y apoyo, con opción de publicar de forma anónima.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: MessagesSquare,
    title: "Muro de historias",
    body: "Publica lo que sientes y elige una categoría: consejos, relaciones, salud o crecimiento personal.",
  },
  {
    icon: Lock,
    title: "Anonimato cuando lo necesites",
    body: "Puedes compartir sin mostrar tu nombre. Nadie verá quién escribió esa publicación.",
  },
  {
    icon: HeartHandshake,
    title: "Reacciones que abrazan",
    body: "Responde con “Me gusta”, “Apoyo” o “Te abrazo” en publicaciones y comentarios.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <span className="font-display text-xl font-bold">
          Círculo <span className="text-primary">de Ellas</span>
        </span>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/normas">Normas</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            <Link to="/auth">Entrar</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-soft">
          <Sparkles className="h-3.5 w-3.5" /> Comunidad privada para mujeres
        </span>
        <h1 className="mt-6 font-display text-4xl leading-tight font-bold sm:text-5xl">
          Un lugar seguro para contarlo todo
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Historias, consejos y preguntas entre mujeres que se escuchan sin juzgar. Con anonimato
          opcional y un círculo que siempre responde con cariño.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            <Link to="/auth">Crear mi cuenta</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to="/normas">Leer las normas</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-20 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="border-border/60 bg-card/90 shadow-soft">
            <CardContent className="space-y-3 pt-6">
              <feature.icon className="h-6 w-6 text-primary" />
              <h2 className="font-display text-lg font-bold">{feature.title}</h2>
              <p className="text-sm text-muted-foreground">{feature.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
