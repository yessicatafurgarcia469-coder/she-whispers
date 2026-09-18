import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { Reactions } from "@/components/Reactions";
import { formatDate } from "@/lib/community";

export type PostRow = {
  id: string;
  created_at: string;
  category: string;
  content: string;
  is_anonymous: boolean;
  is_mine: boolean | null;
  author_id: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export function PostCard({ post }: { post: PostRow }) {
  const queryClient = useQueryClient();

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("posts").delete().eq("id", post.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Publicación eliminada");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card className="border-border/70 shadow-soft">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start gap-3">
          <UserAvatar
            name={post.display_name}
            avatarPath={post.avatar_url}
            anonymous={post.is_anonymous}
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              {post.is_anonymous ? "Anónima" : (post.display_name ?? "Usuaria")}
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p>
          </div>
          <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">
            {post.category}
          </Badge>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>

        <div className="flex flex-wrap items-center gap-3">
          <Reactions postId={post.id} />
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/publicacion/$postId" params={{ postId: post.id }}>
              <MessageCircle className="mr-1.5 h-4 w-4" />
              Comentarios
            </Link>
          </Button>
          {post.is_mine ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => remove.mutate()}
              disabled={remove.isPending}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Borrar
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
