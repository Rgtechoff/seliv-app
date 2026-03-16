'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ListChecks,
  Users,
  Building,
  MessageSquare,
  CreditCard,
  LogOut,
  BadgeCheck,
  Menu,
  X,
  Bell,
  Tag,
  Ticket,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { PageTransition } from '@/components/page-transition';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/shared/theme-toggle';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/missions', label: 'Missions', icon: ListChecks },
  { href: '/admin/vendeurs', label: 'Vendeurs', icon: Users },
  { href: '/admin/clients', label: 'Clients', icon: Building },
  { href: '/admin/abonnements', label: 'Abonnements', icon: BadgeCheck },
  { href: '/admin/chat-moderation', label: 'Modération Chat', icon: MessageSquare },
  { href: '/admin/facturation', label: 'Facturation', icon: CreditCard },
  { href: '/admin/tarifs', label: 'Tarifs', icon: Tag },
  { href: '/admin/promo-codes', label: 'Codes Promo', icon: Ticket },
];

function AdminSidebarContent({
  pathname,
  userRole,
  onLogout,
  onLinkClick,
}: {
  pathname: string;
  userRole: string;
  onLogout: () => void;
  onLinkClick?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <Link href="/admin/dashboard" onClick={onLinkClick} className="flex items-center gap-2">
          <span className="text-xl font-black text-foreground">SELIV</span>
          <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
            Admin
          </span>
        </Link>
        <p className="text-xs text-foreground-secondary mt-1 capitalize">{userRole}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary-light border-l-[3px] border-primary text-foreground font-medium'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-primary-light',
              )}
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-primary' : '')} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-primary-light w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && (!user || !['admin', 'moderateur'].includes(user.role))) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-56 bg-sidebar border-r border-border flex-col shrink-0">
        <AdminSidebarContent pathname={pathname} userRole={user.role} onLogout={logout} />
      </aside>

      {/* Drawer mobile */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -224 }}
              animate={{ x: 0 }}
              exit={{ x: -224 }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed top-0 left-0 h-full w-56 z-50 bg-sidebar border-r border-border flex flex-col md:hidden"
            >
              <div className="flex justify-end p-2">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-md text-foreground-secondary hover:text-foreground hover:bg-primary-light transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <AdminSidebarContent
                pathname={pathname}
                userRole={user.role}
                onLogout={logout}
                onLinkClick={() => setDrawerOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-border bg-sidebar flex items-center justify-between px-4 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-1.5 rounded-md text-foreground-secondary hover:text-foreground hover:bg-primary-light transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="hidden md:block text-sm font-medium text-foreground-secondary">
              Interface d&apos;administration
            </span>
            <span className="md:hidden text-sm font-semibold text-foreground">Administration</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="p-1.5 rounded-md hover:bg-primary-light transition-colors relative">
              <Bell className="h-4 w-4 text-foreground-secondary" />
            </button>
            {user && (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold ml-1">
                {user.firstName?.[0]?.toUpperCase() ?? 'A'}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
