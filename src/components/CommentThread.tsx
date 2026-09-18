import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/UserAvatar";
import { Reactions } from "@/components/Reactions";
import { formatDate } from "@/lib/community";
import { useSession } from "@/lib/session";

type CommentRow = {
  id: string;
  post_id: string;
  parent_id: string | null;
  created_at: string;
  content: string;
  is_anonymous: boolean;
  is_mine: boolean | null;
  author_id: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

function CommentForm({
  postId,
  parentId,
  onDone,
  compact,
}: {
  postId: string;
  parentId?: string | null;
  onDone?: () => void;
  compact?: boolean;
}) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const send = useMutation({
    mutationFn: async () => {
      const text = content.trim();
      if (!user) throw new Error("Necesitas iniciar sesión.");
      if (text.length < 2) throw new Error("Escribe tu comentario.");
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        parent_id: parentId ?? null,
        author_id: user.id,
        content: text,
        is_anonymous: anonymous,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setContent("");
      setAnonymous(false);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      onDone?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        maxLength={2000}
        placeholder={compact ? "Escribe tu respuesta…" : "Deja un comentario amable…"}
        className="min-h-20 resize-none bg-background"
      />
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch
            id={`anon-${parentId ?? "root"}`}
            checked={anonymous}
            onCheckedChange={setAnonymous}
          />
          <Label htmlFor={`anon-${parentId ?? "root"}`} className="text-xs text-muted-foreground">
            Anónimo
          </Label>
        </div>
        <Button
          size="sm"
          className="ml-auto bg-gradient-primary text-primary-foreground hover:opacity-90"
          disabled={send.isPending}
          onClick={() => send.mutate()}
        >
          Comentar
        </Button>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  children,
  postId,
}: {
  comment: CommentRow;
  children: CommentRow[];
  postId: string;
}) {
  const [replying, setReplying] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <UserAvatar
          className="h-9 w-9"
          name={comment.display_name}
          avatarPath={comment.avatar_url}
          anonymous={comment.is_anonymous}
        />
        <div className="min-w-0 flex-1 space-y-2 rounded-2xl bg-muted/60 px-4 py-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-semibold">
              {comment.is_anonymous ? "Anónima" : (comment.display_name ?? "Usuaria")}
            </span>
            <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{comment.content}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Reactions commentId={comment.id} size="sm" />
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setReplying((value) => !value)}
            >
              Responder
            </Button>
          </div>
          {replying ? (
            <CommentForm
              postId={postId}
              parentId={comment.id}
              compact
              onDone={() => setReplying(false)}
            />
          ) : null}
        </div>
      </div>
      {children.length > 0 ? (
        <div className="ml-6 space-y-3 border-l border-border pl-4">
          {children.map((child) => (
            <CommentItem key={child.id} comment={child} children={[]} postId={postId} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CommentThread({ postId }: { postId: string }) {
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments_public")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CommentRow[];
    },
  });

  const roots = comments.filter((comment) => !comment.parent_id);

  return (
    <div className="space-y-6">
      <CommentForm postId={postId} />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando comentarios…</p>
      ) : roots.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay comentarios. Sé la primera en responder.
        </p>
      ) : (
        <div className="space-y-5">
          {roots.map((root) => (
            <CommentItem
              key={root.id}
              comment={root}
              postId={postId}
              children={comments.filter((item) => item.parent_id === root.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
