'use client';


import { useDashboard } from '@/hooks/useERP';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Users,
  Package,
  FileText,
  Boxes,
  IndianRupee,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy load Recharts to avoid loading it during SSR — this is the heaviest dependency
const POStatusChart = dynamic(() => import('@/components/dashboard/POStatusChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const statusColors: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  Submitted: 'bg-amber-100 text-amber-700',
  'Partially Received': 'bg-orange-100 text-orange-700',
  Closed: 'bg-emerald-100 text-emerald-700',
};

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-slate-100 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const recentPOs = data?.recentPOs || [];
  const recentGRNs = data?.recentGRNs || [];

  // PO status distribution for pie chart
  const poStatusData = [
    { name: 'Draft', value: recentPOs.filter((p) => p.status === 'Draft').length },
    { name: 'Submitted', value: recentPOs.filter((p) => p.status === 'Submitted').length },
    { name: 'Partial', value: recentPOs.filter((p) => p.status === 'Partially Received').length },
    { name: 'Closed', value: recentPOs.filter((p) => p.status === 'Closed').length },
  ].filter((d) => d.value > 0);

  const kpis = [
    {
      title: 'Total Vendors',
      value: stats?.totalVendors ?? 0,
      icon: Users,
      color: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Active Products',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: 'from-cyan-500 to-blue-500',
      bgLight: 'bg-cyan-50',
      textColor: 'text-cyan-600',
    },
    {
      title: 'Purchase Orders',
      value: stats?.totalPOs ?? 0,
      icon: FileText,
      color: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
      subtitle: `${stats?.pendingPOs ?? 0} pending`,
    },
    {
      title: 'Stock Value',
      value: `₹${(stats?.totalStockValue ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: IndianRupee,
      color: 'from-violet-500 to-purple-500',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                  {kpi.subtitle && (
                    <p className="text-xs text-amber-600 font-medium mt-1">{kpi.subtitle}</p>
                  )}
                </div>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', kpi.bgLight)}>
                  <kpi.icon className={cn('w-5 h-5', kpi.textColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* PO Status Pie Chart — lazy loaded */}
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">PO Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <POStatusChart data={poStatusData} />
          </CardContent>
        </Card>

        {/* Recent POs Table */}
        <Card className="lg:col-span-2 border-slate-200/80 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700">Recent Purchase Orders</CardTitle>
            <Link href="/purchase-orders">
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 text-xs">
                View All →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentPOs.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No purchase orders yet. Create your first PO!</p>
              ) : (
                recentPOs.slice(0, 5).map((po) => (
                  <div key={po.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{po.poNumber}</p>
                        <p className="text-xs text-slate-400">{po.vendorName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-700">
                        ₹{po.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                      <Badge className={cn('text-[10px] font-medium border-0', statusColors[po.status] || 'bg-slate-100 text-slate-600')}>
                        {po.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/purchase-orders/new">
          <Card className="border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group border-dashed">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">New Purchase Order</p>
                <p className="text-xs text-slate-400">Create a new PO for a vendor</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/grn/new">
          <Card className="border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group border-dashed">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <Boxes className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Post Goods Receipt</p>
                <p className="text-xs text-slate-400">Record received goods against a PO</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/vendors">
          <Card className="border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group border-dashed">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                <Users className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Manage Vendors</p>
                <p className="text-xs text-slate-400">Add or update vendor records</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent GRNs */}
      {recentGRNs.length > 0 && (
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700">Recent Goods Receipts</CardTitle>
            <Link href="/grn">
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 text-xs">
                View All →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentGRNs.map((grn) => (
                <div key={grn.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                      <Boxes className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{grn.grnNumber}</p>
                      <p className="text-xs text-slate-400">{grn.vendorName} • {grn.items.length} items</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">Posted</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
