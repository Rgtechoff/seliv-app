'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, History, CreditCard, ListChecks, CalendarDays, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const CLIENT_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/missions/new', label: 'Mission', icon: PlusCircle },
  { href: '/history', label: 'Historique', icon: History },
  { href: '/subscription', label: 'Abonnement', icon: CreditCard },
];

const VENDEUR_NAV = [
  { href: '/vendeur/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendeur/missions', label: 'Missions', icon: ListChecks },
  { href: '/vendeur/disponibilites', label: 'Planning', icon: CalendarDays },
  { href: '/vendeur/profil', label: 'Profil', icon: User },
];

interface AppBottomNavProps {
  role: 'client' | 'vendeur';
}

export function AppBottomNav({ role }: AppBottomNavProps) {
  const pathname = usePathname();
  const NAV = role === 'client' ? CLIENT_NAV : VENDEUR_NAV;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className="relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px]"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-indigo-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors duration-200',
                  isActive ? 'text-indigo-600' : 'text-gray-400',
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors duration-200',
                  isActive ? 'text-indigo-600' : 'text-gray-400',
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
