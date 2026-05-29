'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/page-shell';
import { ScrollNext } from '@/components/layout/scroll-next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLanguage } from '@/lib/hooks/useLanguage';
import {
  ArrowRight,
  Code2,
  Download,
  Lock,
  Sparkles,
  Star,
  Zap,
  CreditCard,
  FileArchive,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  Clock,
  Check,
} from 'lucide-react';

const JOURNEY_CARDS = [
  {
    icon: Code2,
    titleVi: 'Java & Spring Boot',
    titleEn: 'Java & Spring Boot',
    descVi: 'API, admin, microservice và mẫu tích hợp doanh nghiệp.',
    descEn: 'APIs, admin panels, and enterprise integration templates.',
    href: '/browse?category=Java+Spring+Boot',
  },
  {
    icon: CreditCard,
    titleVi: 'PHP, .NET, Node.js',
    titleEn: 'PHP, .NET, Node.js',
    descVi: 'Laravel, ASP.NET Core, Express/NestJS — sẵn sàng triển khai.',
    descEn: 'Laravel, ASP.NET Core, Express/NestJS — ready to deploy.',
    href: '/browse',
  },
  {
    icon: Download,
    titleVi: 'Python & Data',
    titleEn: 'Python & Data',
    descVi: 'FastAPI, Django và backend cho SaaS, marketplace số.',
    descEn: 'FastAPI, Django, and backends for SaaS and digital products.',
    href: '/browse?category=Python',
  },
  {
    icon: BarChart3,
    titleVi: 'Dashboard Seller',
    titleEn: 'Seller Dashboard',
    descVi: 'Quản lý catalog, analytics và đơn hàng.',
    descEn: 'Manage catalog, analytics, and orders.',
    href: '/dashboard',
  },
];

const TESTIMONIALS = [
  {
    quoteVi: 'Chọn được bộ Laravel e-commerce phù hợp, triển khai shop trong vài ngày.',
    quoteEn: 'Found the right Laravel e-commerce pack and launched our shop in days.',
    name: 'Hoàng Anh',
    roleVi: 'Tech Lead',
    roleEn: 'Tech Lead',
  },
  {
    quoteVi: 'Giao diện marketplace rõ ràng, quy trình mua và nhận file rất mượt.',
    quoteEn: 'Clear marketplace UI with a smooth purchase and download flow.',
    name: 'Mai Linh',
    roleVi: 'Full-stack Developer',
    roleEn: 'Full-stack Developer',
  },
  {
    quoteVi: 'Tài liệu kèm ZIP đủ chi tiết để chạy PoC ngay trên máy local.',
    quoteEn: 'Bundled docs are detailed enough to run a local PoC immediately.',
    name: 'Tuấn Vũ',
    roleVi: 'Backend Engineer',
    roleEn: 'Backend Engineer',
  },
];

export default function Home() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const router = useRouter();
  const [search, setSearch] = useState('');

  function handleQuickSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/browse?q=${encodeURIComponent(q)}` : '/browse');
  }

  const faq = [
    {
      qVi: 'CoreGate Cloud khác gì GitHub miễn phí?',
      qEn: 'How is CoreGate Cloud different from free repos?',
      aVi: 'Mỗi gói là project hoàn chỉnh: source có cấu trúc, README, hướng dẫn cài đặt và quy trình giao file — phù hợp triển khai thật, không chỉ snippet rời.',
      aEn: 'Each pack is a complete project with structure, README, setup guide, and delivery flow — ready for real use, not loose snippets.',
    },
    {
      qVi: 'Có những ngôn ngữ / stack nào?',
      qEn: 'Which stacks are available?',
      aVi: 'Java Spring Boot, PHP (Laravel), C# (.NET), Node.js (Express/NestJS), Python (FastAPI/Django) và mở rộng thêm theo từng giai đoạn.',
      aEn: 'Java Spring Boot, PHP (Laravel), C# (.NET), Node.js (Express/Nest), Python (FastAPI/Django), with more stacks over time.',
    },
    {
      qVi: 'Sau thanh toán tôi nhận source code như thế nào?',
      qEn: 'How do I receive source code after payment?',
      aVi: 'Hệ thống gửi mã truy cập qua email (nếu bật SMTP). Bạn nhập mã tại trang Nhập mã tải hoặc xem link ngay trên trang kết quả thanh toán.',
      aEn: 'You receive an access code by email (if enabled). Redeem on the download page or use links on the payment result page.',
    },
    {
      qVi: 'Tôi có thể bán source code của mình không?',
      qEn: 'Can I sell my own source code?',
      aVi: 'Có. Đăng ký seller, quản lý catalog trên dashboard và đóng gói file ZIP theo hướng dẫn.',
      aEn: 'Yes. Register as a seller, manage your catalog, and ship ZIP packages per our guide.',
    },
  ];

  const qualityItems = isVi
    ? [
        'Đa dạng ngành: web API, admin, e-commerce, SaaS, microservice.',
        'Mỗi gói kèm README, cấu hình môi trường và hướng dẫn chạy local/Docker.',
        'Mua xong nhận mã tải — giao file ZIP tự động sau thanh toán.',
        'Bảo mật đơn hàng và mã truy cập download.',
      ]
    : [
        'Multiple domains: web APIs, admin, e-commerce, SaaS, microservices.',
        'Each pack includes README, env setup, and local/Docker run guides.',
        'Instant download codes after checkout — automated ZIP delivery.',
        'Secure orders and download access codes.',
      ];

  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.35_0.1_305/0.12),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-20 sm:px-6 md:pt-20 md:pb-28 lg:px-8">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <p className="section-label mb-5 inline-flex items-center justify-center gap-2 md:mb-6">
              <Sparkles className="h-4 w-4 shrink-0" />
              {isVi ? 'Marketplace công nghệ' : 'Technology marketplace'}
            </p>

            <h1 className="font-display text-4xl font-bold leading-[1.12] tracking-tight text-balance sm:text-5xl md:text-[3.25rem]">
              {isVi ? (
                <>
                  Source Code{' '}
                  <span className="brand-text-gradient">Đa Ngành</span>
                  <br className="hidden sm:block" />
                  <span> Sẵn Sàng Triển Khai</span>
                </>
              ) : (
                <>
                  <span className="brand-text-gradient">Multi-Stack</span> Source Code
                  <br />
                  Ready to Ship
                </>
              )}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:mt-6 md:text-lg">
              {isVi
                ? 'Mua bán source code Java, PHP, .NET, Node.js, Python — từ API, admin, e-commerce đến SaaS. Thanh toán an toàn, tải file ngay sau khi mua.'
                : 'Buy and sell source across Java, PHP, .NET, Node.js, Python — APIs, admin, e-commerce, SaaS. Secure checkout and instant downloads.'}
            </p>

            <div className="glass-card mt-8 w-full p-6 md:mt-10 md:p-8">
              <div className="mx-auto w-full max-w-2xl space-y-5 text-center">
                <div className="space-y-2">
                  <h2 className="font-display text-xl font-semibold text-white md:text-2xl">
                    {isVi ? 'Tra cứu nhanh' : 'Quick search'}
                  </h2>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {isVi
                      ? 'Tìm theo ngôn ngữ, lĩnh vực hoặc tên dự án.'
                      : 'Search by language, domain, or project name.'}
                  </p>
                </div>
                <form
                  onSubmit={handleQuickSearch}
                  className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
                >
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={
                      isVi
                        ? 'Laravel shop, FastAPI, NestJS, .NET API...'
                        : 'Laravel shop, FastAPI, NestJS, .NET API...'
                    }
                    className="field-input min-h-12 flex-1 text-center sm:text-left"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="brand-gradient min-h-12 w-full shrink-0 rounded-xl border-0 px-6 shadow-lg shadow-primary/15 sm:w-auto"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      {isVi ? 'Bắt đầu khám phá' : 'Start exploring'}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </form>
              </div>
            </div>

            <div className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
              <Link href="/browse" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 border-primary/40 bg-primary/5 hover:bg-primary/10 sm:min-w-[220px]"
                >
                  {isVi ? 'Xem tất cả sản phẩm' : 'View all products'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full text-primary hover:bg-primary/10 sm:min-w-[220px]"
                >
                  {isVi ? 'Đăng ký bán source' : 'Become a seller'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <ScrollNext targetId="value-section" />
      </section>

      {/* Giá trị — layout giống ảnh Thần Số Việt */}
      <section id="value-section" className="relative py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3 mb-10">
            <p className="section-label">{isVi ? 'Giá Trị Nhận Được' : 'What You Get'}</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white">
              {isVi ? (
                <>Source Code Sẽ Giúp Gì Cho Dự Án?</>
              ) : (
                <>How Source Packs Help Your Project</>
              )}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {isVi
                ? 'CoreGate Cloud tập hợp source code nhiều lĩnh vực — chọn đúng stack, triển khai nhanh, giảm thời gian khởi động dự án.'
                : 'CoreGate Cloud curates source across many stacks — pick the right fit and ship faster.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="ts-card p-6 md:p-8 space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/25">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-white">
                {isVi ? 'Đa Stack & Đa Ngành' : 'Multi-Stack Catalog'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isVi
                  ? 'Java, PHP, C#, Node.js, Python — API, CMS, shop online, dashboard, microservice và nhiều mẫu thực tế khác.'
                  : 'Java, PHP, C#, Node.js, Python — APIs, CMS, shops, dashboards, microservices, and more.'}
              </p>
            </div>
            <div className="ts-card p-6 md:p-8 space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/25">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-white">
                {isVi ? 'Gói ZIP & Tài Liệu Chuẩn' : 'Standard ZIP & Documentation'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isVi
                  ? 'Mỗi gói gồm source + README + hướng dẫn cài đặt — dễ bàn giao team hoặc làm PoC nhanh.'
                  : 'Each pack includes source, README, and setup guide — easy handoff or fast PoC.'}
              </p>
            </div>
          </div>

          <div className="ts-card-highlight p-8 md:p-10 space-y-6">
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-center text-white">
              {isVi ? 'Chất Lượng Vượt Trội' : 'Superior Quality'}
            </h3>
            <ul className="space-y-4 max-w-2xl mx-auto">
              {qualityItems.map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="check-icon mt-0.5">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ScrollNext targetId="features-section" />
      </section>

      {/* Marquee */}
      <div className="border-y border-border bg-card/40 overflow-hidden py-3">
        <div className="flex whitespace-nowrap marquee-track">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex items-center gap-8 px-8 text-sm text-muted-foreground">
              <span>✨ JAVA · PHP · .NET</span>
              <span>✨ NODE.JS · PYTHON</span>
              <span>✨ E-COMMERCE · SAAS</span>
              <span>✨ COREGATE CLOUD</span>
              <span>✨ SOURCE CODE MARKETPLACE</span>
            </span>
          ))}
        </div>
      </div>

      {/* Trải nghiệm toàn diện */}
      <section id="features-section" className="relative py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-14">
            <p className="section-label">{isVi ? 'Trải Nghiệm Toàn Diện' : 'Full Experience'}</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold">
              {isVi ? 'Hệ Thống Marketplace' : 'Marketplace System'}{' '}
              <span className="brand-text-gradient">{isVi ? 'Chuyên Sâu' : 'In Depth'}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {isVi
                ? 'Từ chọn sản phẩm đến thanh toán và tải source — quy trình rõ ràng cho mọi stack.'
                : 'From browse to checkout and download — a clear flow for every stack.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Lock,
                titleVi: 'Thanh Toán An Toàn',
                titleEn: 'Secure Payments',
                descVi: 'Thanh toán trực tuyến an toàn, xác nhận đơn hàng tự động.',
                descEn: 'Secure online checkout with automatic order confirmation.',
              },
              {
                icon: Zap,
                titleVi: 'Giao File Tức Thì',
                titleEn: 'Instant Delivery',
                descVi: 'Mã truy cập và token tải ngay sau khi thanh toán thành công.',
                descEn: 'Access codes and download tokens right after payment.',
              },
              {
                icon: FileArchive,
                titleVi: 'Gói ZIP Chuẩn',
                titleEn: 'Standard ZIP Packs',
                descVi: 'Source + README + cấu hình, sẵn sàng chạy local hoặc Docker.',
                descEn: 'Source + README + config, ready for local or Docker.',
              },
              {
                icon: BarChart3,
                titleVi: 'Phân Tích Seller',
                titleEn: 'Seller Analytics',
                descVi: 'Theo dõi doanh thu, đơn hàng và xu hướng tải xuống.',
                descEn: 'Track revenue, orders, and download trends.',
              },
            ].map((item) => (
              <div key={item.titleEn} className="glass-card p-6 space-y-4 group hover:border-primary/30 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/20 group-hover:bg-primary/25 transition-colors">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold">{isVi ? item.titleVi : item.titleEn}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{isVi ? item.descVi : item.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase — Nghệ thuật / demo visual */}
      <section className="relative py-20 border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="section-label">{isVi ? 'Quy Trình Mua Hàng' : 'Purchase Flow'}</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                {isVi ? (
                  <>
                    Từ Chọn Stack <br />
                    <span className="brand-text-gradient">Đến Tải Source</span>
                  </>
                ) : (
                  <>
                    From Picking a Stack <br />
                    <span className="brand-text-gradient">To Download</span>
                  </>
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {isVi
                  ? 'Mỗi sản phẩm là một gói source hoàn chỉnh: mã nguồn có cấu trúc, tài liệu kèm theo và giao file tự động sau khi thanh toán.'
                  : 'Each product is a complete pack: structured code, documentation, and automated delivery after payment.'}
              </p>
              <ul className="space-y-3 text-sm">
                {[
                  isVi ? 'Catalog đa ngôn ngữ & đa lĩnh vực' : 'Multi-language, multi-domain catalog',
                  isVi ? 'README và hướng dẫn triển khai từng gói' : 'README and deployment guide per pack',
                  isVi ? 'Mã tải & link download sau thanh toán' : 'Download codes and links after checkout',
                ].map((line) => (
                  <li key={line} className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    {line}
                  </li>
                ))}
              </ul>
              <Link href="/browse">
                <Button className="gap-2 brand-gradient rounded-full border-0">
                  {isVi ? 'Khám phá catalog' : 'Explore catalog'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Mock payment flow diagram */}
            <div className="glass-card p-6 md:p-8 space-y-4">
              <p className="text-xs text-primary font-medium uppercase tracking-wider">
                {isVi ? 'Luồng mua hàng' : 'Purchase flow'}
              </p>
              <div className="rounded-xl border border-white/10 bg-background/60 p-5 font-mono text-xs space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  POST /api/orders
                </div>
                <div className="pl-4 border-l border-primary/30 text-muted-foreground">→ order PENDING</div>
                <div className="flex items-center gap-2 text-primary">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  POST /api/checkout
                </div>
                <div className="pl-4 border-l border-primary/30 text-muted-foreground">→ cổng thanh toán</div>
                <div className="flex items-center gap-2 text-primary">
                  <span className="h-2 w-2 rounded-full bg-violet-400" />
                  IPN + Return verify
                </div>
                <div className="pl-4 border-l border-primary/30 text-emerald-400/90">→ COMPLETED + mã CG-***</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {['Pay', 'IPN', 'ZIP'].map((label, i) => (
                  <div
                    key={label}
                    className="rounded-lg border border-white/10 bg-primary/10 py-3 text-primary font-semibold"
                  >
                    {i + 1}. {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chọn hành trình */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-14">
            <p className="section-label">{isVi ? 'Lối vào nhanh' : 'Quick paths'}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {isVi ? 'Chọn Hành Trình Phù Hợp' : 'Choose Your Path'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {JOURNEY_CARDS.map((card) => (
              <Link key={card.titleEn} href={card.href} className="group">
                <div className="glass-card h-full p-6 flex flex-col hover:border-primary/40 transition-all hover:-translate-y-1">
                  <card.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {isVi ? card.titleVi : card.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground flex-1">{isVi ? card.descVi : card.descEn}</p>
                  <span className="mt-4 text-sm text-primary flex items-center gap-1">
                    {isVi ? 'Tìm hiểu trước' : 'Learn more'}
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <p className="section-label">{isVi ? 'Hơn 500+ Developer Tin Tưởng' : '500+ Developers Trust Us'}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {isVi ? 'Chia Sẻ Từ Cộng Đồng' : 'Community Stories'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass-card p-6 space-y-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  &ldquo;{isVi ? t.quoteVi : t.quoteEn}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{isVi ? t.roleVi : t.roleEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-10">
            <p className="section-label">{isVi ? 'Giải Đáp Thắc Mắc' : 'FAQ'}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {isVi ? 'Câu Hỏi Thường Gặp' : 'Common Questions'}
            </h2>
          </div>
          <Accordion type="single" collapsible className="glass-card px-6 divide-y divide-white/10">
            {faq.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-white/10">
                <AccordionTrigger className="font-display text-base hover:no-underline hover:text-primary py-5">
                  {isVi ? item.qVi : item.qEn}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {isVi ? item.aVi : item.aEn}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-accent/10 p-10 md:p-16 text-center space-y-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.38_0.1_305/0.14),transparent_60%)]" />
            <div className="relative space-y-6">
              <p className="section-label">{isVi ? 'Bắt đầu ngay' : 'Get started'}</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold">
                {isVi ? (
                  <>
                    Sở Hữu Source Code <br />
                    <span className="brand-text-gradient">Từ 199.000đ</span>
                  </>
                ) : (
                  <>
                    Own Source Code <br />
                    <span className="brand-text-gradient">From ₫199,000</span>
                  </>
                )}
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                {isVi
                  ? 'Thanh toán an toàn — nhận mã tải file ZIP ngay sau khi giao dịch thành công.'
                  : 'Secure checkout — get your ZIP download code right after payment.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link href="/browse">
                  <Button
                    size="lg"
                    className="brand-gradient rounded-full border-0 shadow-xl shadow-primary/15 gap-2 px-8"
                  >
                    {isVi ? 'Mở Khóa Ngay' : 'Unlock Now'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                {isVi ? 'Thanh toán an toàn, bảo mật' : 'Secure checkout'}
              </p>
            </div>
          </div>
        </div>
      </section>

    </PageShell>
  );
}
