import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/UserAvatar";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Mi perfil — Círculo de Ellas" },
      { name: "description", content: "Edita tu foto, tu nombre y tu biografía." },
      { property: "og:title", content: "Mi perfil — Círculo de Ellas" },
      { property: "og:description", content: "Edita tu foto, tu nombre y tu biografía." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, bio, avatar_url")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const name = displayName.trim();
      if (name.length < 2) throw new Error("Escribe tu nombre o apodo.");
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: name.slice(0, 40), bio: bio.trim().slice(0, 500) })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Perfil actualizado ✨");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      if (!file.type.startsWith("image/")) throw new Error("Elige una imagen.");
      if (file.size > 5 * 1024 * 1024) throw new Error("La imagen debe pesar menos de 5 MB.");
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user!.id}/avatar-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file);
      if (uploadError) throw uploadError;
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: path })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Foto de perfil actualizada");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Mi perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Así te verán las demás cuando no publiques de forma anónima.
        </p>
      </div>

      <Card className="border-border/70 shadow-soft">
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center gap-4">
            <UserAvatar
              className="h-20 w-20"
              name={profile?.display_name ?? null}
              avatarPath={profile?.avatar_url ?? null}
            />
            <div>
              <Button
                variant="secondary"
                onClick={() => fileRef.current?.click()}
                disabled={upload.isPending}
              >
                Cambiar foto
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">JPG o PNG, hasta 5 MB.</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) upload.mutate(file);
                  event.target.value = "";
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Nombre o apodo</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={40}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={500}
              placeholder="Cuéntanos en pocas líneas quién eres…"
              className="min-h-24 resize-none"
            />
          </div>

          <Button
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            Guardar cambios
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
