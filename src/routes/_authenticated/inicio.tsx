import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostComposer } from "@/components/PostComposer";
import { PostCard, type PostRow } from "@/components/PostCard";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/community";

type FeedSearch = { q?: string | undefined; cat?: string | undefined };

export const Route = createFileRoute("/_authenticated/inicio")({
  validateSearch: (search: Record<string, unknown>): FeedSearch => ({
    q: typeof search['q'] === "string" && search['q'] ? search['q'] : undefined,
    cat: typeof search['cat'] === "string" && search['cat'] ? search['cat'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Muro — Círculo de Ellas" },
      {
        name: "description",
        content: "Historias, consejos y preguntas compartidas por la comunidad de mujeres.",
      },
      { property: "og:title", content: "Muro — Círculo de Ellas" },
      {
        property: "og:description",
        content: "Historias, consejos y preguntas compartidas por la comunidad de mujeres.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Feed,
});

function Feed() {
  const { q, cat } = Route.useSearch();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts", { q, cat }],
    queryFn: async () => {
      let query = supabase
        .from("posts_public")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (cat) query = query.eq("category", cat);
      if (q) query = query.ilike("content", `%${q}%`);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as PostRow[];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Muro de la comunidad</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comparte lo que llevas dentro. Estás entre mujeres que te escuchan.
        </p>
      </div>

      <PostComposer />

      <div className="flex flex-wrap gap-2">
        <Link to="/inicio" search={{ q, cat: undefined }}>
          <Badge
            className={
              cat
                ? "bg-card text-muted-foreground hover:bg-secondary"
                : "bg-primary text-primary-foreground"
            }
          >
            Todas
          </Badge>
        </Link>
        {CATEGORIES.map((category) => (
          <Link key={category} to="/inicio" search={{ q, cat: category }}>
            <Badge
              className={
                cat === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-secondary"
              }
            >
              {category}
            </Badge>
          </Link>
        ))}
      </div>

      {q ? (
        <p className="text-sm text-muted-foreground">
          Resultados para <span className="font-semibold text-foreground">“{q}”</span>
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando publicaciones…</p>
      ) : posts.length === 0 ? (
        <p className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
          Aún no hay publicaciones aquí. ¡Empieza tú la conversación!
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
