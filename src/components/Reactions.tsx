import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { REACTIONS, type ReactionKind } from "@/lib/community";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

type Row = { kind: string; user_id: string };

export function Reactions({
  postId,
  commentId,
  size = "default",
}: {
  postId?: string;
  commentId?: string;
  size?: "default" | "sm";
}) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const column = postId ? "post_id" : "comment_id";
  const targetId = (postId ?? commentId) as string;
  const queryKey = ["reactions", column, targetId];

  const { data: rows = [] } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reactions")
        .select("kind,user_id")
        .eq(column, targetId);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const toggle = useMutation({
    mutationFn: async (kind: ReactionKind) => {
      if (!user) return;
      const mine = rows.find((r) => r.kind === kind && r.user_id === user.id);
      if (mine) {
        const { error } = await supabase
          .from("reactions")
          .delete()
          .eq(column, targetId)
          .eq("kind", kind)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reactions").insert({
          kind,
          user_id: user.id,
          post_id: postId ?? null,
          comment_id: commentId ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return (
    <div className="flex flex-wrap gap-2">
      {REACTIONS.map((reaction) => {
        const count = rows.filter((r) => r.kind === reaction.kind).length;
        const active = !!user && rows.some((r) => r.kind === reaction.kind && r.user_id === user.id);
        return (
          <button
            key={reaction.kind}
            type="button"
            onClick={() => toggle.mutate(reaction.kind)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              size === "sm" && "px-2.5 py-1 text-[11px]",
              active
                ? "border-primary bg-secondary text-secondary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary/60",
            )}
          >
            <span aria-hidden>{reaction.emoji}</span>
            <span>{reaction.label}</span>
            {count > 0 ? <span className="text-foreground">{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
