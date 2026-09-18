import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PostCard, type PostRow } from "@/components/PostCard";
import { CommentThread } from "@/components/CommentThread";

export const Route = createFileRoute("/_authenticated/publicacion/$postId")({
  head: () => ({
    meta: [
      { title: "Publicación — Círculo de Ellas" },
      { name: "description", content: "Lee la conversación completa y deja tu comentario." },
      { property: "og:title", content: "Publicación — Círculo de Ellas" },
      { property: "og:description", content: "Lee la conversación completa y deja tu comentario." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostDetail,
});

function PostDetail() {
  const { postId } = Route.useParams();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts_public")
        .select("*")
        .eq("id", postId)
        .maybeSingle();
      if (error) throw error;
      return data as PostRow | null;
    },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
        <Link to="/inicio">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Volver al muro
        </Link>
      </Button>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : !post ? (
        <p className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
          Esta publicación ya no está disponible.
        </p>
      ) : (
        <>
          <PostCard post={post} />
          <Card className="border-border/70 shadow-soft">
            <CardContent className="space-y-5 pt-6">
              <h2 className="font-display text-xl font-bold">Comentarios</h2>
              <CommentThread postId={postId} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
