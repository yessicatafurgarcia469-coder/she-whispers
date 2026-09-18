import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COMMUNITY_RULES } from "@/lib/community";

export const Route = createFileRoute("/normas")({
  head: () => ({
    meta: [
      { title: "Normas de la comunidad — Círculo de Ellas" },
      {
        name: "description",
        content:
          "Las reglas que hacen de Círculo de Ellas un espacio seguro, respetuoso y confidencial para mujeres.",
      },
      { property: "og:title", content: "Normas de la comunidad — Círculo de Ellas" },
      {
        property: "og:description",
        content:
          "Las reglas que hacen de Círculo de Ellas un espacio seguro, respetuoso y confidencial para mujeres.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Rules,
});

function Rules() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <div>
        <h1 className="font-display text-3xl font-bold">Normas de la comunidad</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Este círculo funciona porque lo cuidamos entre todas.
        </p>
      </div>

      <div className="space-y-4">
        {COMMUNITY_RULES.map((rule, index) => (
          <Card key={rule.title} className="border-border/70 shadow-soft">
            <CardContent className="flex gap-4 pt-6">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-soft font-display font-bold">
                {index + 1}
              </span>
              <div>
                <h2 className="font-display text-lg font-bold">{rule.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{rule.body}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="bg-gradient-primary text-primary-foreground hover:opacity-90">
          <Link to="/inicio">Ir al muro</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
