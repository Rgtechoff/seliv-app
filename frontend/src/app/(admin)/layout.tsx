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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/page-transition';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/missions', label: 'Missions', icon: ListChecks },
  { href: '/admin/vendeurs', label: 'Vendeurs', icon: Users },
  { href: '/admin/clients', label: 'Clients', icon: Building },
  { href: '/admin/abonnements', label: 'Abonnements', icon: BadgeCheck },
  { href: '/admin/chat-moderation', label: 'Modération chat', icon: MessageSquare },
  { href: '/admin/facturation', label: 'Facturation', icon: CreditCard },
];

function AdminSidebarContent({
  pathname,
  userRole,
  onLogout,
}: {
  pathname: string;
  userRole: string;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="p-4 border-b border-gray-700">
        <Link href="/admin/dashboard" className="text-xl font-bold">
          SELIV Admin
        </Link>
        <p className="text-xs text-gray-400 mt-0.5 capitalize">{userRole}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
              pathname === href
                ? 'bg-white/20 text-white'
                : 'text-gray-300 hover:bg-white/10 hover:text-white',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Ferme le drawer à chaque changement de route
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
    <div className="min-h-screen flex">
      {/* Sidebar — desktop uniquement */}
      <aside className="hidden md:flex w-56 bg-gray-900 text-white flex-col shrink-0">
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
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -224 }}
              animate={{ x: 0 }}
              exit={{ x: -224 }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed top-0 left-0 h-full w-56 z-50 bg-gray-900 text-white flex flex-col md:hidden"
            >
              <div className="flex justify-end p-2">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <AdminSidebarContent pathname={pathname} userRole={user.role} onLogout={logout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <header className="flex md:hidden h-14 border-b bg-white items-center justify-between px-4 sticky top-0 z-30">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-700">Administration</span>
          <div className="w-9" />
        </header>

        {/* Header desktop */}
        <header className="hidden md:flex h-14 border-b bg-white items-center px-6 shrink-0">
          <h1 className="text-sm font-medium text-muted-foreground">Interface d&apos;administration</h1>
        </header>

        <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
