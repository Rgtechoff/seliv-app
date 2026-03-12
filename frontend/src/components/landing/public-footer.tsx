import Link from 'next/link';

const PRODUCT_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'Comment ça marche', href: '/#how-it-works' },
  { label: 'Tarifs', href: '/#pricing' },
  { label: 'Vendeurs', href: '/vendeurs' },
];

const ACCOUNT_LINKS = [
  { label: 'Connexion', href: '/login' },
  { label: 'Inscription', href: '/register' },
];

const LEGAL_LINKS = [
  { label: 'Mentions légales', href: '#' },
  { label: 'CGU', href: '#' },
  { label: 'Politique de confidentialité', href: '#' },
];

export function PublicFooter() {
  return (
    <footer className="bg-sidebar border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-2xl font-black text-primary tracking-tight hover:text-primary/80 transition-colors">
              SELIV
            </Link>
            <p className="mt-2 text-sm text-foreground-secondary">The Live Selling Network</p>
          </div>

          {/* Produit */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Produit
            </h3>
            <ul className="space-y-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Compte
            </h3>
            <ul className="space-y-2">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Légal
            </h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-foreground-secondary">
            &copy; 2025 SELIV. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
