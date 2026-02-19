import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center bg-gradient-to-br from-violet-50 via-purple-50 to-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-40 -translate-x-1/4" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div className="flex flex-col gap-6">
            <div>
              <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0 text-sm px-3 py-1">
                🚀 500+ lives réalisés
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Boostez vos ventes avec un vendeur{' '}
                <span className="text-indigo-600">Live</span> professionnel
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-gray-600 max-w-xl">
              SELIV connecte les marques avec les meilleurs vendeurs live shopping. Réservez votre
              session en quelques clics.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="text-base px-8" asChild>
                <Link href="/register">Réserver un Live</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8" asChild>
                <Link href="/vendeurs">Voir nos vendeurs</Link>
              </Button>
            </div>
          </div>

          {/* Right: illustration placeholder */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-lg aspect-square rounded-3xl bg-gradient-to-br from-indigo-400 via-purple-400 to-violet-500 shadow-2xl flex items-center justify-center">
              <div className="absolute inset-4 rounded-2xl bg-white/20 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
                  <span className="text-4xl">📺</span>
                </div>
                <div className="text-white text-center">
                  <p className="text-2xl font-bold">Live en direct</p>
                  <p className="text-sm opacity-80 mt-1">Vendez où vous voulez</p>
                </div>
                <div className="flex gap-2 mt-2">
                  {['Whatnot', 'TikTok', 'Instagram'].map((platform) => (
                    <span
                      key={platform}
                      className="bg-white/30 text-white text-xs font-medium px-3 py-1 rounded-full"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
