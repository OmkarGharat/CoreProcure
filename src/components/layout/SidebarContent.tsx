'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Users,
  Package,
  LogOut,
  FileText,
  Boxes,
  ClipboardCheck,
  Receipt,
  CreditCard,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navSections = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Procurement',
    items: [
      { label: 'Purchase Orders', path: '/purchase-orders', icon: FileText },
      { label: 'Goods Receipts', path: '/grn', icon: Boxes },
      { label: 'Quality Inspections', path: '/qi', icon: ClipboardCheck },
      { label: 'Vendor Invoices', path: '/invoices', icon: Receipt },
      { label: 'Payments', path: '/payments', icon: CreditCard },
    ],
  },

  {
    label: 'Master Data',
    items: [
      { label: 'Vendors', path: '/vendors', icon: Users },
      { label: 'Products', path: '/products', icon: Package },
    ],
  },
];

function SidebarContent({ collapsed, onLinkClick }: { collapsed: boolean; onLinkClick?: () => void }) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
          <Package className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">CoreProcure</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Enterprise ERP</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-6 px-3">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onLinkClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon className={cn(
                        "w-[18px] h-[18px] shrink-0 transition-colors",
                        isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                      )} />
                      {!collapsed && <span>{item.label}</span>}
                      {isActive && !collapsed && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* User & Logout */}
      <div className="border-t border-slate-100 p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">
                {user.name?.charAt(0).toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full text-slate-500 hover:text-red-600 hover:bg-red-50 justify-start",
            collapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="ml-3 text-sm">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}

export { SidebarContent };
