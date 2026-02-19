import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
        <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
          Prêt à lancer votre premier Live ?
        </h2>
        <p className="text-lg text-indigo-100 max-w-xl">
          Rejoignez des centaines de marques qui boostent leurs ventes avec SELIV.
        </p>
        <Button
          size="lg"
          className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-base px-10 mt-2"
          asChild
        >
          <Link href="/register">Créer mon compte</Link>
        </Button>
      </div>
    </section>
  );
}
