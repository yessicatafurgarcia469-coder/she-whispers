import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/community";

export const Route = createFileRoute("/_authenticated/categorias")({
  head: () => ({
    meta: [
      { title: "Categorías — Círculo de Ellas" },
      {
        name: "description",
        content: "Explora los temas de la comunidad: consejos, relaciones, salud y más.",
      },
      { property: "og:title", content: "Categorías — Círculo de Ellas" },
      {
        property: "og:description",
        content: "Explora los temas de la comunidad: consejos, relaciones, salud y más.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Categories,
});

function Categories() {
  const { data: counts = {} } = useQuery({
    queryKey: ["category-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts_public").select("category").limit(1000);
      if (error) throw error;
      const result: Record<string, number> = {};
      for (const row of data ?? []) {
        const key = (row as { category: string }).category;
        result[key] = (result[key] ?? 0) + 1;
      }
      return result;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Categorías</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Elige un tema y descubre lo que otras mujeres están compartiendo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((category) => (
          <Link key={category} to="/inicio" search={{ cat: category, q: undefined }}>
            <Card className="h-full border-border/70 transition-shadow hover:shadow-soft">
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="font-display text-lg font-bold">{category}</p>
                  <p className="text-xs text-muted-foreground">
                    {counts[category] ?? 0} publicaciones
                  </p>
                </div>
                <span className="rounded-full bg-gradient-soft px-3 py-1 text-xs font-semibold">
                  Ver
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
