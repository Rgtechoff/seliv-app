'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  CreditCard,
  Package,
  History,
  Settings,
  Shield,
  Menu,
  LogOut,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/use-auth';
import { ThemeToggle } from '@/components/shared/theme-toggle';

const NAV_ITEMS = [
  { href: '/super-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/super-admin/vendeurs', label: 'Vendeurs', icon: Users },
  { href: '/super-admin/clients', label: 'Clients', icon: Building2 },
  { href: '/super-admin/missions', label: 'Missions', icon: Calendar },
  { href: '/super-admin/plans', label: 'Plans & Abonnements', icon: CreditCard },
  { href: '/super-admin/services', label: 'Services & Options', icon: Package },
  { href: '/super-admin/activity-log', label: 'Activity Log', icon: History },
  { href: '/super-admin/configuration', label: 'Configuration', icon: Settings },
];

function SidebarContent({
  pathname,
  onLinkClick,
}: {
  pathname: string;
  onLinkClick?: () => void;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('seliv_token');
    localStorage.removeItem('seliv_user');
    document.cookie = 'seliv_token=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo + badge */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-primary">SELIV</span>
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            SUPER
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Panel d&apos;administration</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Protect route
  React.useEffect(() => {
    if (user && user.role !== 'super_admin') {
      router.push('/login');
    }
  }, [user, router]);

  // Close drawer on nav
  React.useEffect(() => setDrawerOpen(false), [pathname]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border flex-shrink-0">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 md:hidden flex flex-col"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <SidebarContent
                pathname={pathname}
                onLinkClick={() => setDrawerOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1.5 rounded-md hover:bg-muted transition-colors"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Desktop: shield icon + title */}
            <div className="hidden md:flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              <span className="font-semibold text-sm">Super Administration</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="p-1.5 rounded-md hover:bg-muted transition-colors relative">
              <Bell className="w-4 h-4" />
            </button>
            {user && (
              <div className="flex items-center gap-2 ml-2">
                <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.firstName?.[0]?.toUpperCase() ?? 'S'}
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user.firstName}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
