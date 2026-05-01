import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardMeta,
  CardTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  type RecipeState,
} from "@/components/ui";

const COLOR_TOKENS = [
  "bg",
  "surface",
  "surface-2",
  "border",
  "border-strong",
  "text",
  "text-secondary",
  "text-tertiary",
  "text-quaternary",
  "accent",
];

const STATES: RecipeState[] = ["draft", "en-prueba", "aprobada", "archivada"];

export default function DesignPage() {
  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-[880px] px-s-6 py-s-10">
        <header className="mb-s-10 flex items-start justify-between">
          <div>
            <p className="font-sans uppercase tracking-[0.1em] text-caption text-text-tertiary">
              Atelier Culinaire
            </p>
            <h1 className="font-serif italic text-display mt-s-2">
              Design system — Fase 0
            </h1>
            <p className="font-serif italic text-h4 text-text-secondary mt-s-3">
              tokens, fuentes, primitivas. validá la dirección antes de seguir.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <Section label="Tipografía">
          <div className="space-y-s-4">
            <p className="font-serif italic type-display">
              &ldquo;Pichón à la braise, purée bicolore&rdquo;
            </p>
            <p className="font-serif italic type-h2">
              Tartare de remolacha asada
            </p>
            <p className="font-sans type-h3">Hanken Grotesk · h3 sans</p>
            <p className="font-sans type-body">
              Body en Hanken Grotesk. Acentos extendidos: à è ò é í ó ú ñ ç ï ü.
              Pangrama italiano: Quel vituperabile xenofobo zelante assaggia il
              whisky ed esclama: alleluja!
            </p>
            <p className="font-mono type-body tabular-nums">
              0123456789 · 38,00 € · 1h 30min · 4 pax
            </p>
            <p className="gesture-caps-track type-caption text-text-secondary">
              Inicio · Asistente · Recetas · Menús · PDF
            </p>
            <p className="font-serif italic type-caption text-text-tertiary">
              composition · method · plating · allergens
            </p>
          </div>
        </Section>

        <Section label="Paleta">
          <div className="grid grid-cols-5 gap-s-3">
            {COLOR_TOKENS.map((t) => (
              <div key={t} className="flex flex-col gap-s-2">
                <div
                  className="h-16 rounded-sm border border-border"
                  style={{ background: `var(--${t})` }}
                />
                <span className="font-mono text-micro text-text-secondary">
                  --{t}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Botones">
          <div className="flex flex-wrap items-center gap-s-3">
            <Button variant="primary" size="md">
              Aprobar
            </Button>
            <Button variant="ghost" size="md">
              Duplicar
            </Button>
            <Button variant="destructive" size="md">
              Archivar
            </Button>
            <Button variant="primary" size="sm">
              Guardar
            </Button>
            <Button variant="ghost" size="sm">
              Cancelar
            </Button>
            <Button variant="ghost" size="md" disabled>
              Disabled
            </Button>
          </div>
        </Section>

        <Section label="Inputs">
          <div className="flex flex-col gap-s-4">
            <Input placeholder="Buscar receta…" />
            <Textarea placeholder="Anotá una idea…" rows={4} />
          </div>
        </Section>

        <Section label="Cards">
          <div className="grid grid-cols-2 gap-s-4">
            <Card>
              <CardHeader>
                <CardTitle>Pichón à la braise</CardTitle>
                <CardMeta>4 pax · 2h 30min · 38,00 €</CardMeta>
              </CardHeader>
              <p className="font-sans text-body text-text-secondary">
                Pichón entier, betterave rouge, vinaigre de riz infusé
                katsuobushi, café tueste medio.
              </p>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tartare de remolacha asada</CardTitle>
                <CardMeta>2 pax · 30min · 18,00 €</CardMeta>
              </CardHeader>
              <p className="font-sans text-body text-text-secondary">
                Betterave rôtie, câpres, huile d&apos;olive verte, croûtons.
              </p>
            </Card>
          </div>
        </Section>

        <Section label="Estados de receta (badges)">
          <div className="flex flex-wrap items-center gap-s-6">
            {STATES.map((s) => (
              <Badge key={s} state={s} />
            ))}
          </div>
        </Section>

        <Section label="Tabs">
          <Tabs defaultValue="todos">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="prueba">En prueba</TabsTrigger>
              <TabsTrigger value="aprobadas">Aprobadas</TabsTrigger>
            </TabsList>
            <TabsContent value="todos">
              <p className="font-serif italic text-h4 text-text-tertiary">
                24 recetas · 3 prioritarias · 2 en prueba
              </p>
            </TabsContent>
            <TabsContent value="draft">
              <p className="font-serif italic text-h4 text-text-tertiary">
                4 borradores
              </p>
            </TabsContent>
            <TabsContent value="prueba">
              <p className="font-serif italic text-h4 text-text-tertiary">
                2 en prueba
              </p>
            </TabsContent>
            <TabsContent value="aprobadas">
              <p className="font-serif italic text-h4 text-text-tertiary">
                15 aprobadas
              </p>
            </TabsContent>
          </Tabs>
        </Section>
      </div>
    </main>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-s-8">
      <p className="gesture-caps-track type-caption text-text-tertiary mb-s-5">
        {label}
      </p>
      {children}
    </section>
  );
}
