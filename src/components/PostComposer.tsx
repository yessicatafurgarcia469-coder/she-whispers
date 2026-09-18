import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/community";
import { useSession } from "@/lib/session";

export function PostComposer() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [anonymous, setAnonymous] = useState(false);

  const publish = useMutation({
    mutationFn: async () => {
      const text = content.trim();
      if (!user) throw new Error("Necesitas iniciar sesión.");
      if (text.length < 3) throw new Error("Escribe un poco más antes de publicar.");
      if (text.length > 4000) throw new Error("La publicación es demasiado larga.");
      const { error } = await supabase.from("posts").insert({
        author_id: user.id,
        content: text,
        category,
        is_anonymous: anonymous,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setContent("");
      setAnonymous(false);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Tu publicación ya está en el muro 💜");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card className="border-border/70 shadow-soft">
      <CardContent className="space-y-4 pt-6">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={4000}
          placeholder="Comparte tu historia, un consejo o una pregunta…"
          className="min-h-28 resize-none bg-background"
        />
        <div className="flex flex-wrap items-center gap-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-52 bg-background">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Switch id="anon" checked={anonymous} onCheckedChange={setAnonymous} />
            <Label htmlFor="anon" className="text-sm text-muted-foreground">
              Publicar de forma anónima
            </Label>
          </div>

          <Button
            className="ml-auto bg-gradient-primary text-primary-foreground hover:opacity-90"
            disabled={publish.isPending}
            onClick={() => publish.mutate()}
          >
            Publicar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
