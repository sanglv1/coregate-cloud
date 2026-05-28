'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">{ui.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-lg">CoreGate Cloud</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border border-border/40 overflow-hidden">
              <button
                className={`px-3 py-1 text-xs ${isVi ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                onClick={() => setLanguage('vi')}
              >
                VI
              </button>
              <button
                className={`px-3 py-1 text-xs ${!isVi ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
            </div>
            <span className="text-sm text-muted-foreground">
              {session?.user.name || session?.user.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              {ui.logout}
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{ui.pageTitle}</h1>
              <p className="text-muted-foreground">{ui.pageDesc}</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-border">
                {ui.backToDashboard}
              </Button>
            </Link>
          </div>

          {/* Date Range */}
          <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border/40 bg-card/40 p-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{ui.dateFrom}</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-4 py-2 rounded-lg bg-background border border-border text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{ui.dateTo}</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-4 py-2 rounded-lg bg-background border border-border text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-lg border border-border/40 bg-card/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{ui.totalRevenue}</p>
                  <p className="text-2xl font-bold">₫{Math.round(summary.totalRevenue).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-card/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{ui.totalPurchases}</p>
                  <p className="text-2xl font-bold">{summary.totalPurchases}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-card/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{ui.totalDownloads}</p>
                  <p className="text-2xl font-bold">{summary.totalDownloads}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-card/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
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
          <div className="p-6 rounded-lg border border-border/40 bg-card/50">
            <h3 className="text-lg font-semibold mb-4">{ui.revenueTrend}</h3>
            {analytics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
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
          <div className="p-6 rounded-lg border border-border/40 bg-card/50">
            <h3 className="text-lg font-semibold mb-4">{ui.downloadTrend}</h3>
            {analytics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
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
      </div>
    </div>
  );
}
