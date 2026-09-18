import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard, type PostRow } from "@/components/PostCard";

export const Route = createFileRoute("/_authenticated/mis-publicaciones")({
  head: () => ({
    meta: [
      { title: "Mis publicaciones — Círculo de Ellas" },
      { name: "description", content: "Revisa y gestiona todo lo que has compartido." },
      { property: "og:title", content: "Mis publicaciones — Círculo de Ellas" },
      { property: "og:description", content: "Revisa y gestiona todo lo que has compartido." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyPosts,
});

function MyPosts() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts", "mine"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts_public")
        .select("*")
        .eq("is_mine", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PostRow[];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Mis publicaciones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aquí aparecen también las que compartiste de forma anónima.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : posts.length === 0 ? (
        <p className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
          Todavía no has publicado nada.
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={{ ...post, is_mine: true }} />
          ))}
        </div>
      )}
    </div>
  );
}
