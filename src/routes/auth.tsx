import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Círculo de Ellas" },
      {
        name: "description",
        content: "Crea tu cuenta o inicia sesión en la comunidad privada para mujeres.",
      },
      { property: "og:title", content: "Entrar — Círculo de Ellas" },
      {
        property: "og:description",
        content: "Crea tu cuenta o inicia sesión en la comunidad privada para mujeres.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  displayName: z.string().trim().min(2, "Escribe tu nombre o apodo").max(40),
  email: z.string().trim().email("Correo electrónico no válido").max(255),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/inicio", replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!accepted) {
          toast.error("Debes aceptar las normas de la comunidad.");
          return;
        }
        const parsed = signUpSchema.safeParse({ displayName, email, password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message ?? "Revisa los datos");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: parsed.data.displayName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
        navigate({ to: "/inicio", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        navigate({ to: "/inicio", replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Algo salió mal");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="font-display text-3xl font-bold">
            Círculo <span className="text-primary">de Ellas</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Una comunidad privada, cálida y segura para mujeres.
          </p>
        </div>

        <Card className="border-border/70 shadow-soft">
          <CardContent className="pt-6">
            {checkEmail ? (
              <div className="space-y-4 text-center">
                <h1 className="font-display text-xl font-bold">Revisa tu correo</h1>
                <p className="text-sm text-muted-foreground">
                  Te enviamos un enlace de confirmación a <strong>{email}</strong>. Ábrelo para
                  activar tu cuenta y entrar a la comunidad.
                </p>
                <Button variant="ghost" onClick={() => setCheckEmail(false)}>
                  Volver
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
                  {(["login", "signup"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMode(item)}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                        mode === item
                          ? "bg-card text-foreground shadow-soft"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item === "login" ? "Iniciar sesión" : "Registrarme"}
                    </button>
                  ))}
                </div>

                {mode === "signup" ? (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre o apodo</Label>
                    <Input
                      id="name"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder="Ej. Lu, Valentina, Mar…"
                      maxLength={40}
                    />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>

                {mode === "signup" ? (
                  <div className="flex items-start gap-3 rounded-xl bg-secondary/60 p-3">
                    <Checkbox
                      id="rules"
                      checked={accepted}
                      onCheckedChange={(value) => setAccepted(value === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="rules" className="text-xs leading-relaxed font-normal">
                      Confirmo que soy mujer y acepto las{" "}
                      <Link to="/normas" className="font-semibold text-primary underline">
                        normas de la comunidad
                      </Link>
                      : respeto, confidencialidad y cero juicios.
                    </Label>
                  </div>
                ) : null}

                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                >
                  {mode === "login" ? "Entrar" : "Crear mi cuenta"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
