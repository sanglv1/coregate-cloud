import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-xl border border-border/40 bg-card/50 p-8 text-center space-y-6">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <p className="text-muted-foreground">
          This dashboard home is ready. Continue to analytics or browse products.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard/analytics">
            <Button>Open Analytics</Button>
          </Link>
          <Link href="/dashboard/catalog">
            <Button variant="outline">Manage Catalog</Button>
          </Link>
          <Link href="/browse">
            <Button variant="outline">Browse Products</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
