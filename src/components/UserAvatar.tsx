import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initialsOf } from "@/lib/community";
import { cn } from "@/lib/utils";

export function useAvatarUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["avatar", path],
    enabled: !!path,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path as string, 60 * 60);
      if (error) return null;
      return data.signedUrl;
    },
  });
}

export function UserAvatar({
  name,
  avatarPath,
  anonymous,
  className,
}: {
  name?: string | null;
  avatarPath?: string | null;
  anonymous?: boolean;
  className?: string;
}) {
  const { data: url } = useAvatarUrl(anonymous ? null : avatarPath);

  return (
    <Avatar className={cn("h-10 w-10 border border-border", className)}>
      {url && !anonymous ? <AvatarImage src={url} alt={name ?? "Usuaria"} /> : null}
      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
        {anonymous ? "🌸" : initialsOf(name)}
      </AvatarFallback>
    </Avatar>
  );
}
