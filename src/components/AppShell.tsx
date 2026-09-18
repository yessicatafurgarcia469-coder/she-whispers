import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { BookHeart, Home, LayoutGrid, LogOut, Menu, PenLine, Search, User } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserAvatar } from "@/components/UserAvatar";
import { useSession } from "@/lib/session";

const NAV = [
  { to: "/inicio", label: "Inicio", icon: Home },
  { to: "/mis-publicaciones", label: "Mis publicaciones", icon: PenLine },
  { to: "/categorias", label: "Categorías", icon: LayoutGrid },
  { to: "/normas", label: "Normas de la comunidad", icon: BookHeart },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          activeProps={{ className: "bg-secondary text-secondary-foreground" }}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-6">
              <p className="mb-6 font-display text-xl font-bold">Círculo de Ellas</p>
              <NavLinks onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link to="/inicio" className="font-display text-lg font-bold tracking-tight sm:text-xl">
            Círculo <span className="text-primary">de Ellas</span>
          </Link>

          <form
            className="relative ml-auto hidden max-w-xs flex-1 sm:block"
            onSubmit={(event) => {
              event.preventDefault();
              navigate({ to: "/inicio", search: { q: term || undefined, cat: undefined } });
            }}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Buscar publicaciones…"
              className="rounded-full bg-card pl-9"
            />
          </form>

          <div className="ml-auto flex items-center gap-1 sm:ml-0">
            <Button asChild variant="ghost" size="icon" aria-label="Mi perfil">
              <Link to="/perfil">
                <UserAvatar
                  className="h-8 w-8"
                  name={profile?.display_name}
                  avatarPath={profile?.avatar_url}
                />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Cerrar sesión" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="sticky top-24 space-y-6">
            <NavLinks />
            <div className="rounded-2xl bg-gradient-soft p-4 text-sm shadow-soft">
              <p className="flex items-center gap-2 font-display text-base font-bold">
                <User className="h-4 w-4" /> Espacio seguro
              </p>
              <p className="mt-1 text-muted-foreground">
                Aquí escuchamos sin juzgar. Puedes publicar de forma anónima cuando lo necesites.
              </p>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
