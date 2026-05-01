import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../../components/ui/sheet';
import { cn } from '../../lib/utils';
import { LayoutDashboard, ShoppingCart, Users, Package, LogOut, Menu, ChevronLeft, ChevronRight, Boxes } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { 
    label: 'Procurement', 
    icon: ShoppingCart, 
    children: [
      { label: 'Purchase Orders', path: '/purchase-orders', icon: Package },
      { label: 'Goods Receipts', path: '/grn', icon: Boxes },
    ]
  },
  { 
    label: 'Master Data', 
    icon: Users, 
    children: [
      { label: 'Vendors', path: '/vendors', icon: Users },
      { label: 'Products', path: '/products', icon: Package },
    ]
  },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 p-4 border-r border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-blue-600/10 blur-2xl rounded-full mix-blend-screen" />
      
      <div className="flex items-center gap-3 mb-10 mt-2 px-2 relative z-10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-glow shrink-0">
          <Package size={20} className="text-white" />
        </div>
        {!collapsed && <h1 className="text-xl font-bold tracking-tight text-white">CoreProcure</h1>}
      </div>
      
      <nav className="flex-1 space-y-6 relative z-10 overflow-y-auto pr-2 custom-scrollbar">
        {navItems.map((item) => {
          // If it has children, treat it as a group header
          if (item.children) {
            return (
              <div key={item.label} className="space-y-1">
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider",
                  collapsed ? "justify-center text-slate-500" : "text-slate-400"
                )}>
                  <item.icon size={16} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                
                {item.children.map((child) => {
                  const isActive = location.pathname === child.path || location.pathname.startsWith(child.path + '/');
                  return (
                    <Link
                      key={child.path}
                      to={child.path}
                      title={collapsed ? child.label : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                        isActive 
                          ? "bg-blue-600/10 text-blue-400" 
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
                        collapsed && "justify-center"
                      )}
                    >
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />}
                      <child.icon size={18} className={cn("shrink-0", isActive ? "text-blue-500" : "text-slate-500 group-hover:text-slate-300")} />
                      {!collapsed && <span>{child.label}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          }

          // If no children, treat it as a direct link (like Dashboard)
          const isActive = location.pathname === item.path || location.pathname === item.path + '/';
          return (
            <Link
              key={item.path}
              to={item.path!}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive 
                  ? "bg-blue-600/10 text-blue-400" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
                collapsed && "justify-center"
              )}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />}
              <item.icon size={18} className={cn("shrink-0", isActive ? "text-blue-500" : "text-slate-500 group-hover:text-slate-300")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      
      <div className="pt-4 border-t border-slate-800/50 mt-auto relative z-10">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 justify-start",
            collapsed && "justify-center px-0"
          )} 
          onClick={logout}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:block transition-all duration-300 ease-in-out relative z-20", 
        collapsed ? "w-[80px]" : "w-[280px]"
      )}>
        <SidebarContent />
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="absolute top-8 -right-3.5 z-30 text-slate-400 bg-slate-900 hover:text-white rounded-full w-7 h-7 flex items-center justify-center border border-slate-700 shadow-xl transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden absolute top-4 left-4 z-50">
          <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-md shadow-sm border-slate-200">
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px] border-r-0 bg-transparent">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10 w-full">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 pt-16 md:pt-8 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
