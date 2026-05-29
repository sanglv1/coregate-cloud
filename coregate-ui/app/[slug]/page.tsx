import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/page-shell';

interface StaticPageContent {
  title: string;
  description: string;
  sections: string[];
  primaryCta: {
    href: string;
    label: string;
  };
}

const STATIC_PAGES: Record<string, StaticPageContent> = {
  sellers: {
    title: 'Dành cho người bán source code',
    description: 'Quy trình chuẩn để đóng gói, đăng bán và giao sản phẩm source code trên CoreGate Cloud.',
    sections: [
      '1) Đóng gói sản phẩm: gom toàn bộ source vào một file ZIP, kèm README hướng dẫn cài đặt, yêu cầu môi trường, và thông tin license.',
      '2) Chuẩn bị metadata: đặt tên sản phẩm rõ ràng, mô tả tính năng chính, danh sách công nghệ sử dụng, phiên bản tương thích và changelog.',
      '3) Tải lên file: upload bản ZIP phát hành (không chứa file nhạy cảm như .env, secret key, token).',
      '4) Thiết lập giá bán: đặt giá theo độ hoàn thiện, chất lượng tài liệu và cam kết hỗ trợ sau bán.',
      '5) Sau khi bán: cập nhật phiên bản định kỳ, theo dõi phản hồi khách hàng và cải thiện tài liệu để tăng tỉ lệ chuyển đổi.',
      'Mẹo thực tế: nên tách riêng “source package” và “demo package” để người mua dễ đánh giá trước khi thanh toán.',
    ],
    primaryCta: { href: '/signup', label: 'Bắt đầu bán ngay' },
  },
  'buyer-guide': {
    title: 'Hướng dẫn người mua',
    description: 'Quy trình mua source code, thanh toán và nhận link download trên CoreGate Cloud.',
    sections: [
      '1) Chọn sản phẩm phù hợp và thêm vào giỏ hàng.',
      '2) Xác nhận đơn hàng và thanh toán trực tuyến an toàn.',
      '3) Sau khi thanh toán thành công, hệ thống gửi mã nhận source code qua email.',
      '4) Nhập mã tại trang /download-redeem để lấy link tải file source code.',
      '5) Nếu gặp lỗi, liên hệ hỗ trợ để được cấp lại mã.',
      'Lưu ý: Vui lòng lưu trữ file zip và thông tin phiên bản để dễ cập nhật về sau.',
    ],
    primaryCta: { href: '/browse', label: 'Xem danh sách source code' },
  },
  'seller-guide': {
    title: 'Hướng dẫn người bán',
    description: 'Checklist giúp seller upload source code chuyên nghiệp và tăng tỷ lệ chốt đơn.',
    sections: [
      '1) Chuẩn bị bộ source zip sạch, không kèm secret/.env.',
      '2) Thêm README hướng dẫn cài đặt, cấu hình và vận hành.',
      '3) Mô tả rõ công nghệ, version, tính năng và giới hạn sử dụng.',
      '4) Định giá theo mức độ hoàn thiện và cam kết hỗ trợ.',
      '5) Sau khi có đơn, theo dõi phản hồi và cập nhật phiên bản định kỳ.',
    ],
    primaryCta: { href: '/dashboard/catalog', label: 'Mở quản lý sản phẩm' },
  },
  pricing: {
    title: 'Bảng phí',
    description: 'CoreGate Cloud áp dụng mô hình phí đơn giản để bạn tập trung vào việc bán sản phẩm.',
    sections: [
      'Phí nền tảng được tính theo từng đơn hàng thành công.',
      'Không thu phí đăng sản phẩm.',
      'Phí cổng thanh toán áp dụng theo chính sách từ nhà cung cấp thanh toán.',
      'Gói hỗ trợ từ xa: từ 300.000đ / buổi (60-90 phút).',
      'Dịch vụ code dự án theo yêu cầu: báo giá riêng (từ 5.000.000đ / dự án).',
    ],
    primaryCta: { href: '/contact', label: 'Liên hệ tư vấn phí' },
  },
  about: {
    title: 'Về CoreGate Cloud',
    description: 'CoreGate Cloud là nền tảng giúp creator và developer bán sản phẩm số an toàn và minh bạch.',
    sections: [
      'Tập trung source code đa ngành: web, API, mobile backend, SaaS, e-commerce.',
      'Thanh toán trực tuyến và giao file tự động cho thị trường Việt Nam.',
      'Dashboard theo dõi doanh thu, đơn hàng và lượt tải.',
    ],
    primaryCta: { href: '/browse', label: 'Khám phá sản phẩm' },
  },
  blog: {
    title: 'Blog',
    description: 'Chia sẻ kinh nghiệm đóng gói sản phẩm và tăng doanh số digital product.',
    sections: [
      'Case study tăng conversion cho trang sản phẩm source code.',
      'Checklist trước khi publish một package trả phí.',
      'Kinh nghiệm hỗ trợ khách hàng sau khi bán source.',
    ],
    primaryCta: { href: '/browse', label: 'Xem marketplace' },
  },
  contact: {
    title: 'Liên hệ',
    description: 'Cần hỗ trợ xuất bản sản phẩm hoặc tích hợp thanh toán? Hãy liên hệ đội CoreGate.',
    sections: [
      'Email: sangluonganm@gmail.com',
      'Điện thoại: 0972282892',
      'Địa chỉ: Hà Nội, Việt Nam',
      'Hỗ trợ từ xa: từ 300.000đ / buổi.',
      'Code dự án theo yêu cầu: báo giá riêng.',
      'Thời gian phản hồi mục tiêu: trong 24 giờ làm việc.',
    ],
    primaryCta: { href: '/sellers', label: 'Xem hướng dẫn người bán' },
  },
  terms: {
    title: 'Điều khoản dịch vụ',
    description: 'Bằng việc sử dụng CoreGate Cloud, bạn đồng ý tuân thủ các điều khoản vận hành nền tảng.',
    sections: [
      'Người bán chịu trách nhiệm về bản quyền và tính hợp pháp của sản phẩm tải lên.',
      'Nghiêm cấm phát tán mã độc hoặc nội dung vi phạm pháp luật.',
      'CoreGate Cloud có quyền tạm dừng sản phẩm/tài khoản khi phát hiện vi phạm.',
    ],
    primaryCta: { href: '/privacy', label: 'Xem chính sách bảo mật' },
  },
  privacy: {
    title: 'Chính sách bảo mật',
    description: 'Chúng tôi cam kết bảo vệ dữ liệu cá nhân và thông tin giao dịch của người dùng.',
    sections: [
      'Chỉ thu thập dữ liệu cần thiết để vận hành tài khoản và thanh toán.',
      'Không bán thông tin cá nhân cho bên thứ ba.',
      'Thông tin thanh toán xử lý qua cổng tích hợp, không lưu thẻ trên nền tảng.',
    ],
    primaryCta: { href: '/cookies', label: 'Xem chính sách cookie' },
  },
  cookies: {
    title: 'Chính sách cookie',
    description: 'Cookie được dùng để duy trì phiên đăng nhập và cải thiện trải nghiệm.',
    sections: [
      'Cookie thiết yếu: phục vụ đăng nhập và bảo mật phiên.',
      'Cookie phân tích: đo hiệu năng trang ẩn danh.',
      'Bạn có thể tắt cookie trong trình duyệt; một số tính năng có thể bị hạn chế.',
    ],
    primaryCta: { href: '/contact', label: 'Liên hệ hỗ trợ' },
  },
};

interface StaticPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(STATIC_PAGES).map((slug) => ({ slug }));
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { slug } = await params;
  const page = STATIC_PAGES[slug];

  if (!page) {
    notFound();
  }

  return (
    <PageShell mainClassName="px-4 py-12 md:py-16">
      <div className="w-full max-w-3xl mx-auto ts-card p-8 md:p-10 space-y-6">
        <div className="space-y-3 text-center">
          <p className="section-label">CoreGate Cloud</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white">{page.title}</h1>
          <p className="text-muted-foreground">{page.description}</p>
        </div>
        <div className="space-y-3">
          {page.sections.map((section) => (
            <p key={section} className="text-sm leading-relaxed text-muted-foreground border-l-2 border-fuchsia-500/30 pl-4">
              {section}
            </p>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/">
            <Button variant="outline" className="btn-outline-dark rounded-full">Về trang chủ</Button>
          </Link>
          <Link href={page.primaryCta.href}>
            <Button className="brand-gradient rounded-full border-0">{page.primaryCta.label}</Button>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
