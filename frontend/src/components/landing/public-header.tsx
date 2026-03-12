'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/hooks/use-auth';

const ROLE_DASHBOARD: Record<string, string> = {
  client: '/dashboard',
  vendeur: '/vendeur/dashboard',
  moderateur: '/moderateur/dashboard',
  admin: '/admin/dashboard',
};

const NAV_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'Comment ça marche', href: '/#how-it-works' },
  { label: 'Tarifs', href: '/#pricing' },
  { label: 'Vendeurs', href: '/vendeurs' },
];

function UserAvatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold select-none">
      {initials}
    </div>
  );
}

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const dashboardHref = user ? (ROLE_DASHBOARD[user.role] ?? '/dashboard') : '/dashboard';

  return (
    <header className="sticky top-0 z-50 bg-sidebar/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-black text-primary shrink-0 tracking-tight">
            SELIV
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right zone */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-primary/10 transition-colors">
                    <UserAvatar firstName={user.firstName} lastName={user.lastName} />
                    <span className="text-sm font-medium text-foreground">{user.firstName}</span>
                    <ChevronDown className="w-4 h-4 text-foreground-secondary" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-card border-border">
                  <DropdownMenuItem asChild>
                    <Link href={dashboardHref}>Mon Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/vendeurs">Explorer les vendeurs</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-400 focus:text-red-400 cursor-pointer"
                  >
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground-secondary hover:text-foreground hover:bg-primary/10"
                  asChild
                >
                  <Link href="/login">Se connecter</Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                  asChild
                >
                  <Link href="/register">S&apos;inscrire</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-foreground-secondary hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-sidebar px-4 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-foreground-secondary hover:text-primary transition-colors py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border space-y-2">
            {isAuthenticated && user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="block text-sm font-medium text-foreground py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  Mon Dashboard
                </Link>
                <Link
                  href="/vendeurs"
                  className="block text-sm font-medium text-foreground py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  Explorer les vendeurs
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="block text-sm font-medium text-red-400 py-1"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-border text-foreground hover:bg-primary/10"
                  asChild
                >
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Se connecter
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                  asChild
                >
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    S&apos;inscrire
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
