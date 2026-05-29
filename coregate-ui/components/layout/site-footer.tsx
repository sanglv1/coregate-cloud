'use client';

import Link from 'next/link';
import { SiteLogo } from '@/components/brand/site-logo';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/hooks/useLanguage';

export function SiteFooter() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  return (
    <footer className="border-t border-border bg-background/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <SiteLogo className="max-w-[200px]" />
            <p className="text-base text-muted-foreground leading-relaxed">
              {isVi
                ? 'Marketplace source code đa ngành — Java, PHP, .NET, Node.js, Python và nhiều lĩnh vực công nghệ khác.'
                : 'Multi-stack source code marketplace — Java, PHP, .NET, Node.js, Python and more.'}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-semibold text-primary">{isVi ? 'Sản phẩm' : 'Products'}</h4>
            <ul className="space-y-2.5 text-base text-muted-foreground">
              <li><Link href="/browse" className="hover:text-foreground transition-colors">{isVi ? 'Danh mục Source Code' : 'Source Catalog'}</Link></li>
              <li><Link href="/download-redeem" className="hover:text-foreground transition-colors">{isVi ? 'Nhập mã tải' : 'Redeem Code'}</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">{isVi ? 'Bảng giá' : 'Pricing'}</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-primary">{isVi ? 'Tài nguyên' : 'Resources'}</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/buyer-guide" className="hover:text-foreground transition-colors">{isVi ? 'Hướng dẫn mua' : 'Buyer Guide'}</Link></li>
              <li><Link href="/seller-guide" className="hover:text-foreground transition-colors">{isVi ? 'Hướng dẫn bán' : 'Seller Guide'}</Link></li>
              <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">{isVi ? 'Giới thiệu' : 'About'}</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-semibold text-primary">{isVi ? 'Hỗ trợ' : 'Support'}</h4>
            <ul className="space-y-2.5 text-base text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <a href="mailto:sangluonganm@gmail.com" className="hover:text-foreground">sangluonganm@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <a href="tel:0972282892" className="hover:text-foreground">0972282892</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70 mt-0.5" />
                <span>Hà Nội, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-base text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CoreGate Cloud. {isVi ? 'Bảo lưu mọi quyền.' : 'All rights reserved.'}</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-foreground">{isVi ? 'Điều khoản' : 'Terms'}</Link>
            <Link href="/privacy" className="hover:text-foreground">{isVi ? 'Bảo mật' : 'Privacy'}</Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground/70 mt-8 italic font-display">
          {isVi
            ? '"Công nghệ đúng stack — triển khai nhanh hơn mỗi ngày."'
            : '"The right stack — ship faster every day."'}
        </p>
      </div>
    </footer>
  );
}
