'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/page-shell';
import { DashboardNav } from '@/components/layout/dashboard-nav';
import { clearSession, useRequireRole } from '@/lib/hooks/useAuth';
import { buildApiUrl } from '@/lib/config';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LogOut, TrendingUp, DollarSign, Download, Eye } from 'lucide-react';

const INITIAL_START_DATE = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const INITIAL_END_DATE = new Date().toISOString().split('T')[0];

interface AnalyticsData {
  id: string;
  date: string;
  views: number;
  purchases: number;
  revenue: number;
  downloadCount: number;
}

interface AnalyticsSummary {
  totalRevenue: number;
  totalPurchases: number;
  totalDownloads: number;
  totalViews: number;
  averageRevenue: number;
  averagePurchasesPerDay: number;
}

export default function AnalyticsDashboard() {
  const { session, loading: authLoading } = useRequireRole('seller');
  const { language, setLanguage } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: INITIAL_START_DATE,
    endDate: INITIAL_END_DATE,
  });
  const router = useRouter();
  const { toast } = useToast();
  const isVi = language === 'vi';

  const ui = {
    pageTitle: isVi ? 'Phân tích doanh thu' : 'Revenue Analytics',
    pageDesc: isVi ? 'Theo dõi hiệu suất bán hàng và lượt tải sản phẩm theo thời gian.' : 'Track sales performance and product downloads over time.',
    backToDashboard: isVi ? 'Về Dashboard' : 'Back to Dashboard',
    logout: isVi ? 'Đăng xuất' : 'Logout',
    loading: isVi ? 'Đang tải dữ liệu...' : 'Loading analytics...',
    failedLoad: isVi ? 'Không thể tải dữ liệu analytics' : 'Failed to load analytics',
    failedLogout: isVi ? 'Không thể đăng xuất' : 'Failed to logout',
    totalRevenue: isVi ? 'Tổng doanh thu' : 'Total Revenue',
    totalPurchases: isVi ? 'Tổng đơn hàng' : 'Total Purchases',
    totalDownloads: isVi ? 'Tổng lượt tải' : 'Total Downloads',
    totalViews: isVi ? 'Tổng lượt xem' : 'Total Views',
    revenueTrend: isVi ? 'Xu hướng doanh thu' : 'Revenue Trend',
    downloadTrend: isVi ? 'Xu hướng lượt tải' : 'Download Trend',
    noData: isVi ? 'Chưa có dữ liệu trong khoảng thời gian đã chọn' : 'No data for selected range',
    dateFrom: isVi ? 'Từ ngày' : 'Start Date',
    dateTo: isVi ? 'Đến ngày' : 'End Date',
  };

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    async function fetchAnalytics() {
      try {
        const params = new URLSearchParams(dateRange);
        const response = await fetch(buildApiUrl(`/api/analytics?${params.toString()}`));
        
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data.data);
          setSummary(data.summary);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: ui.failedLoad,
          });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Something went wrong',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [session, dateRange, toast]);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
    }
  }, [authLoading, session, router]);

  async function handleLogout() {
    try {
      await fetch(buildApiUrl('/api/auth/sign-out'), { method: 'POST' });
      clearSession();
      router.push('/');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: ui.failedLogout,
      });
    }
  }

  if (authLoading || loading) {
    return <PageShell showFooter={false} centered><p className="text-muted-foreground">{ui.loading}</p></PageShell>;
  }

  return (
    <PageShell mainClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <DashboardNav />
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <p className="section-label mb-2">Seller</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-white">{ui.pageTitle}</h1>
            <p className="text-muted-foreground mt-1">{ui.pageDesc}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex rounded-lg border border-white/10 overflow-hidden text-xs">
              <button type="button" className={`px-2.5 py-1.5 ${isVi ? 'bg-white/10 text-white' : 'text-muted-foreground'}`} onClick={() => setLanguage('vi')}>VI</button>
              <button type="button" className={`px-2.5 py-1.5 ${!isVi ? 'bg-white/10 text-white' : 'text-muted-foreground'}`} onClick={() => setLanguage('en')}>EN</button>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-white">
              <LogOut className="w-4 h-4" />
              {ui.logout}
            </Button>
          </div>
        </div>

          <div className="flex flex-wrap items-end gap-4 ts-card p-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{ui.dateFrom}</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="field-input w-auto"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{ui.dateTo}</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="field-input w-auto"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="ts-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{ui.totalRevenue}</p>
                  <p className="text-2xl font-bold">₫{Math.round(summary.totalRevenue).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="ts-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{ui.totalPurchases}</p>
                  <p className="text-2xl font-bold">{summary.totalPurchases}</p>
                </div>
              </div>
            </div>

            <div className="ts-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{ui.totalDownloads}</p>
                  <p className="text-2xl font-bold">{summary.totalDownloads}</p>
                </div>
              </div>
            </div>

            <div className="ts-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{ui.totalViews}</p>
                  <p className="text-2xl font-bold">{summary.totalViews}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <div className="ts-card p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4">{ui.revenueTrend}</h3>
            {analytics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#050505',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.75rem',
                      color: '#f4f4f8',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {ui.noData}
              </div>
            )}
          </div>

          {/* Downloads Chart */}
          <div className="ts-card p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4">{ui.downloadTrend}</h3>
            {analytics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#050505',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.75rem',
                      color: '#f4f4f8',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="downloadCount" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {ui.noData}
              </div>
            )}
          </div>
        </div>
    </PageShell>
  );
}
