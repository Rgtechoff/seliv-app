import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/30 via-primary/10 to-background">
      <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center gap-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
          Prêt à lancer votre premier Live ?
        </h2>
        <p className="text-lg text-foreground-secondary max-w-xl">
          Rejoignez des centaines de marques qui boostent leurs ventes avec SELIV.
        </p>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white rounded-lg px-10 font-medium transition-colors text-base mt-2"
          asChild
        >
          <Link href="/register">Créer mon compte</Link>
        </Button>
      </div>
    </section>
  );
}
