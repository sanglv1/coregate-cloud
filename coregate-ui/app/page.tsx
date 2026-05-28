'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lock, Zap, Globe, TrendingUp, Code, FileArchive, Headset, ShieldCheck, PhoneCall, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/hooks/useLanguage';

export default function Home() {
  const { language, setLanguage } = useLanguage();
  const isVi = language === 'vi';

  const content = {
    appName: 'CoreGate Cloud',
    signIn: isVi ? 'Đăng nhập' : 'Sign In',
    getStarted: isVi ? 'Bắt đầu' : 'Get Started',
    heroTitle: isVi
      ? 'Nền tảng mua bán source code công nghệ'
      : 'Marketplace for Technology Source Code',
    heroDescription: isVi
      ? 'Đăng bán source code, template, plugin và tài nguyên kỹ thuật số một cách chuyên nghiệp. Nhận thanh toán nhanh với tích hợp VNPAY và quy trình giao file rõ ràng.'
      : 'Sell source code, templates, plugins, and digital assets professionally. Get paid quickly with VNPAY integration and a clear delivery flow.',
    startSelling: isVi ? 'Bắt đầu bán' : 'Start Selling',
    browseProducts: isVi ? 'Xem sản phẩm' : 'Browse Products',
    productsListed: isVi ? 'Sản phẩm công nghệ' : 'Technology Products',
    activeSellers: isVi ? 'Nhà bán hoạt động' : 'Active Sellers',
    satisfiedCustomers: isVi ? 'Khách hàng hài lòng' : 'Satisfied Customers',
    everythingYouNeed: isVi ? 'Mọi thứ bạn cần để bán source code' : 'Everything You Need to Sell Source Code',
    completeDescription: isVi
      ? 'Từ đóng gói source, thanh toán đến phân tích doanh thu - tất cả trên một nền tảng.'
      : 'From packaging source code to payment and revenue analytics - all in one platform.',
    securePayments: isVi ? 'Thanh toán an toàn' : 'Secure Payments',
    securePaymentsDesc: isVi
      ? 'Tích hợp VNPAY giúp thanh toán nhanh và tin cậy.'
      : 'Integrated VNPAY for fast and reliable checkout.',
    lightningFast: isVi ? 'Giao file nhanh' : 'Fast Delivery',
    lightningFastDesc: isVi
      ? 'Sản phẩm được cấp quyền tải ngay sau khi thanh toán thành công.'
      : 'Downloads are unlocked right after successful payment.',
    globalReach: isVi ? 'Tiếp cận khách hàng rộng hơn' : 'Reach More Buyers',
    globalReachDesc: isVi
      ? 'Mô tả sản phẩm rõ ràng, hỗ trợ đa ngôn ngữ để tăng chuyển đổi.'
      : 'Clear product pages and multilingual support improve conversion.',
    sellerAnalytics: isVi ? 'Phân tích doanh thu' : 'Seller Analytics',
    sellerAnalyticsDesc: isVi
      ? 'Theo dõi doanh thu, đơn hàng và lượt tải theo thời gian.'
      : 'Track revenue, orders, and download metrics over time.',
    sellerFlowTitle: isVi ? 'Quy trình dành cho người bán source code' : 'Source Code Seller Workflow',
    flow1Title: isVi ? '1) Đóng gói sản phẩm' : '1) Package Product',
    flow1Desc: isVi
      ? 'Nén source thành ZIP, thêm README cài đặt, license và hướng dẫn sử dụng.'
      : 'Bundle source as ZIP with setup README, license, and usage guide.',
    flow2Title: isVi ? '2) Đăng bán và định giá' : '2) Publish and Price',
    flow2Desc: isVi
      ? 'Mô tả công nghệ, phiên bản tương thích, lộ trình cập nhật để tăng niềm tin.'
      : 'Describe stack, compatibility, and update roadmap to build buyer trust.',
    flow3Title: isVi ? '3) Hỗ trợ sau bán' : '3) Post-sale Support',
    flow3Desc: isVi
      ? 'Nhận phản hồi, cập nhật phiên bản và chăm sóc khách hàng.'
      : 'Collect feedback, release updates, and support buyers.',
    readyToStart: isVi ? 'Sẵn sàng bắt đầu?' : 'Ready to Start?',
    joinThousands: isVi
      ? 'Tham gia cộng đồng creator/developer bán sản phẩm công nghệ trên CoreGate Cloud.'
      : 'Join creators and developers selling technology products on CoreGate Cloud.',
    createAccount: isVi ? 'Tạo tài khoản người bán' : 'Create Seller Account',
    exploreMarketplace: isVi ? 'Khám phá marketplace' : 'Explore Marketplace',
    product: isVi ? 'Sản phẩm' : 'Product',
    company: isVi ? 'Công ty' : 'Company',
    legal: isVi ? 'Pháp lý' : 'Legal',
    connect: isVi ? 'Liên hệ' : 'Connect',
    forSellers: isVi ? 'Dành cho người bán' : 'For Sellers',
    pricing: isVi ? 'Bảng phí' : 'Pricing',
    about: isVi ? 'Giới thiệu' : 'About',
    blog: 'Blog',
    contact: isVi ? 'Liên hệ' : 'Contact',
    terms: isVi ? 'Điều khoản' : 'Terms',
    privacy: isVi ? 'Bảo mật' : 'Privacy',
    cookies: isVi ? 'Cookie' : 'Cookies',
    support247: isVi ? 'Hỗ trợ kỹ thuật 24/7' : '24/7 Technical Support',
    contactNow: isVi ? 'Liên hệ ngay' : 'Contact Now',
    trustTitle: isVi ? 'Tại sao chọn CoreGate Cloud?' : 'Why CoreGate Cloud?',
    trust1: isVi ? 'Mô hình bán source code chuyên biệt' : 'Source-code-first marketplace model',
    trust2: isVi ? 'Thanh toán nội địa tối ưu với VNPAY' : 'Optimized local checkout with VNPAY',
    trust3: isVi ? 'Theo dõi doanh thu và lượt tải theo thời gian thực' : 'Track revenue and downloads in real time',
    remoteSupport: isVi ? 'Ho tro tu xa' : 'Remote Support',
    remoteSupportDesc: isVi ? 'Tu 300.000d/buoi cho cai dat, fix loi, tu van ky thuat.' : 'From 300,000 VND/session for setup, bug fixing, and technical consultation.',
    projectCoding: isVi ? 'Code du an theo yeu cau' : 'Custom Project Development',
    projectCodingDesc: isVi ? 'Bao gia rieng theo pham vi va timeline, tu 5.000.000d/du an.' : 'Custom quote by scope and timeline, from 5,000,000 VND/project.',
    domainInspired: isVi ? 'Trải nghiệm chuyên nghiệp, tối ưu chuyển đổi' : 'Professional experience built for conversion',
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border/40 bg-gradient-to-r from-primary/15 via-blue-500/10 to-fuchsia-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-xs md:text-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>{content.support247}</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="tel:0972282892" className="flex items-center gap-1 hover:text-foreground">
              <PhoneCall className="w-3.5 h-3.5" />
              0972282892
            </a>
            <a href="mailto:sangluonganm@gmail.com" className="flex items-center gap-1 hover:text-foreground">
              <Mail className="w-3.5 h-3.5" />
              sangluonganm@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-lg">{content.appName}</span>
          </div>
          <div className="flex items-center gap-4">
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
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {content.signIn}
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                {content.getStarted}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.25),transparent_45%),radial-gradient(circle_at_left,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.12),transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs text-primary">
                {content.domainInspired}
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
                  {content.heroTitle}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl text-balance">
                  {content.heroDescription}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 gap-2 shadow-lg shadow-primary/20">
                    {content.startSelling} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/browse">
                  <Button variant="outline" size="lg" className="border-primary/40 hover:bg-primary/10">
                    {content.browseProducts}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="ghost" size="lg" className="gap-2 text-primary hover:bg-primary/10">
                    {content.contactNow}
                    <PhoneCall className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-background p-4">
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-xs text-muted-foreground">{content.productsListed}</div>
                </div>
                <div className="rounded-lg border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-background p-4">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-xs text-muted-foreground">{content.activeSellers}</div>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-background p-4">
                  <div className="text-2xl font-bold">10K+</div>
                  <div className="text-xs text-muted-foreground">{content.satisfiedCustomers}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-card p-6 shadow-sm">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <Code className="w-5 h-5" />
                  <span className="font-semibold">{isVi ? 'Sản phẩm công nghệ' : 'Technology Assets'}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isVi
                    ? 'Source code, template, plugin, script automation và tài liệu kỹ thuật được đóng gói chuẩn để triển khai nhanh.'
                    : 'Source code, templates, plugins, automation scripts, and technical assets packaged for fast deployment.'}
                </p>
              </div>
              <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-card p-6 shadow-sm">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <Lock className="w-5 h-5" />
                  <span className="font-semibold">{content.securePayments}</span>
                </div>
                <p className="text-sm text-muted-foreground">{content.securePaymentsDesc}</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-card p-6 shadow-sm">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">{content.sellerAnalytics}</span>
                </div>
                <p className="text-sm text-muted-foreground">{content.sellerAnalyticsDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/40 bg-card/30 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">{content.everythingYouNeed}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {content.completeDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <div className="space-y-4 p-6 rounded-lg border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-card hover:from-violet-500/15 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{content.securePayments}</h3>
                <p className="text-muted-foreground">
                  {content.securePaymentsDesc}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="space-y-4 p-6 rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-card hover:from-blue-500/15 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{content.lightningFast}</h3>
                <p className="text-muted-foreground">
                  {content.lightningFastDesc}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="space-y-4 p-6 rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-card hover:from-emerald-500/15 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{content.globalReach}</h3>
                <p className="text-muted-foreground">
                  {content.globalReachDesc}
                </p>
              </div>

              {/* Feature 4 */}
              <div className="space-y-4 p-6 rounded-lg border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/10 to-card hover:from-fuchsia-500/15 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{content.sellerAnalytics}</h3>
                <p className="text-muted-foreground">
                  {content.sellerAnalyticsDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border/40 bg-gradient-to-r from-card/50 via-primary/5 to-card/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-semibold mb-4">{content.trustTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-background p-4">{content.trust1}</div>
            <div className="rounded-lg border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-background p-4">{content.trust2}</div>
            <div className="rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-background p-4">{content.trust3}</div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-lg border border-border/40 bg-card/50 p-5 space-y-3">
            <h3 className="font-semibold">{isVi ? 'Danh muc pho bien' : 'Popular Categories'}</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Java Spring Boot</li>
              <li>Payment Gateway Integration</li>
              <li>Subscription Billing</li>
              <li>Merchant Hosted Checkout</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/40 bg-card/50 p-5 space-y-3">
            <h3 className="font-semibold">{isVi ? 'San pham moi cap nhat' : 'Latest Uploads'}</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>VNPAY Pay Demo - payment-demo.zip</li>
              <li>VNPAY Payment Link Demo - paymentlink-demo.zip</li>
              <li>VNPAY Preauth Demo - preauth-demo.zip</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/40 bg-card/50 p-5 space-y-3">
            <h3 className="font-semibold">{isVi ? 'Hoat dong gan day' : 'Recent Activities'}</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>{isVi ? 'Don hang moi vua thanh toan thanh cong.' : 'A new order has been paid successfully.'}</li>
              <li>{isVi ? 'Nguoi ban vua cap nhat phien ban source code.' : 'Seller published a source code update.'}</li>
              <li>{isVi ? 'Yeu cau ho tro da duoc xu ly.' : 'A support request has been resolved.'}</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-card/50 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-semibold">{isVi ? 'Huong dan mua/ban source code' : 'Buyer/Seller Guides'}</h3>
            <p className="text-sm text-muted-foreground">
              {isVi ? 'Tai lieu huong dan quy trinh tai file, upload source code va chinh sach ho tro.' : 'Guides for download flow, upload process, and support policy.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/buyer-guide">
              <Button variant="outline">{isVi ? 'Huong dan nguoi mua' : 'Buyer Guide'}</Button>
            </Link>
            <Link href="/seller-guide">
              <Button>{isVi ? 'Huong dan nguoi ban' : 'Seller Guide'}</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border/40 bg-card/50 p-5 space-y-2">
            <h3 className="font-semibold">{content.remoteSupport}</h3>
            <p className="text-sm text-muted-foreground">{content.remoteSupportDesc}</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card/50 p-5 space-y-2">
            <h3 className="font-semibold">{content.projectCoding}</h3>
            <p className="text-sm text-muted-foreground">{content.projectCodingDesc}</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">{content.sellerFlowTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-card p-6 space-y-3">
              <Code className="w-6 h-6 text-primary" />
              <h3 className="font-semibold">{content.flow1Title}</h3>
              <p className="text-sm text-muted-foreground">{content.flow1Desc}</p>
            </div>
            <div className="rounded-lg border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-card p-6 space-y-3">
              <FileArchive className="w-6 h-6 text-primary" />
              <h3 className="font-semibold">{content.flow2Title}</h3>
              <p className="text-sm text-muted-foreground">{content.flow2Desc}</p>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-card p-6 space-y-3">
              <Headset className="w-6 h-6 text-primary" />
              <h3 className="font-semibold">{content.flow3Title}</h3>
              <p className="text-sm text-muted-foreground">{content.flow3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="bg-gradient-to-r from-primary/20 via-violet-500/15 to-blue-500/15 border border-primary/30 rounded-2xl p-8 md:p-16 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">{content.readyToStart}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.joinThousands}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90">
                {content.createAccount}
              </Button>
            </Link>
            <Link href="/browse">
              <Button variant="outline" size="lg">
                {content.exploreMarketplace}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <h4 className="font-semibold">{content.product}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/browse" className="hover:text-foreground">{content.browseProducts}</Link></li>
                <li><Link href="/sellers" className="hover:text-foreground">{content.forSellers}</Link></li>
                <li><Link href="/buyer-guide" className="hover:text-foreground">{isVi ? 'Huong dan nguoi mua' : 'Buyer Guide'}</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">{content.pricing}</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">{content.company}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">{content.about}</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">{content.blog}</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">{content.contact}</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">{content.legal}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-foreground">{content.terms}</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">{content.privacy}</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground">{content.cookies}</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">{content.connect}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /><a href="mailto:sangluonganm@gmail.com" className="hover:text-foreground">sangluonganm@gmail.com</a></li>
                <li className="flex items-center gap-2"><PhoneCall className="w-4 h-4" /><a href="tel:0972282892" className="hover:text-foreground">0972282892</a></li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>Hà Nội, Việt Nam</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2026 CoreGate Cloud. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
