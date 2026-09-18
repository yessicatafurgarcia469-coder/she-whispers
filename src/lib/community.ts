export const CATEGORIES = [
  "Consejos",
  "Relaciones",
  "Salud",
  "Crecimiento Personal",
  "Maternidad",
  "Trabajo",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const REACTIONS = [
  { kind: "like", label: "Me gusta", emoji: "💗" },
  { kind: "support", label: "Apoyo", emoji: "✨" },
  { kind: "hug", label: "Te abrazo", emoji: "🤗" },
] as const;

export type ReactionKind = (typeof REACTIONS)[number]["kind"];

export const COMMUNITY_RULES = [
  {
    title: "Un espacio exclusivo para mujeres",
    body: "Esta comunidad está reservada para mujeres. Al registrarte confirmas que lo eres y que respetas ese acuerdo.",
  },
  {
    title: "Respeto siempre",
    body: "Nada de insultos, burlas, comentarios machistas, racistas u homófobos. Cada historia merece cuidado.",
  },
  {
    title: "Confidencialidad",
    body: "Lo que se comparte aquí se queda aquí. No compartas capturas ni datos de otras usuarias fuera de la comunidad.",
  },
  {
    title: "Cero juicios",
    body: "Escuchamos antes de opinar. Si no puedes aportar algo amable o útil, mejor guarda silencio.",
  },
  {
    title: "Sin spam ni ventas",
    body: "No se permite publicidad, cadenas ni enlaces sospechosos.",
  },
  {
    title: "Anonimato disponible",
    body: "Puedes publicar de forma anónima cuando lo necesites. Respeta también el anonimato de las demás.",
  },
];

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initialsOf(name: string | null | undefined) {
  if (!name) return "A";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
