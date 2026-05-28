import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';

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
    primaryCta: {
      href: '/signup',
      label: 'Bắt đầu bán ngay',
    },
  },
  'buyer-guide': {
    title: 'Huong dan nguoi mua',
    description: 'Quy trinh mua source code, thanh toan va nhan link download tren CoreGate Cloud.',
    sections: [
      '1) Chon san pham phu hop va them vao gio hang.',
      '2) Xac nhan don hang va thanh toan qua VNPAY.',
      '3) Sau khi thanh toan thanh cong, he thong gui ma nhan source code qua email.',
      '4) Nhap ma tai trang /download-redeem de lay link tai file source code.',
      '5) Neu gap loi, ban co the vao trang don hang hoac lien he ho tro de duoc cap lai ma.',
      'Luu y: Vui long luu tru file zip va thong tin phien ban de de dang cap nhat ve sau.',
    ],
    primaryCta: {
      href: '/browse',
      label: 'Xem danh sach source code',
    },
  },
  'seller-guide': {
    title: 'Huong dan nguoi ban',
    description: 'Checklist giup seller upload source code chuyen nghiep va tang ty le chot don.',
    sections: [
      '1) Chuan bi bo source zip sach, khong kem secret/.env.',
      '2) Them README huong dan cai dat, cau hinh va van hanh.',
      '3) Mo ta ro cong nghe, version, tinh nang va gioi han su dung.',
      '4) Dinh gia theo muc do hoan thien va cam ket ho tro.',
      '5) Sau khi co don, theo doi phan hoi va cap nhat phien ban dinh ky.',
    ],
    primaryCta: {
      href: '/dashboard/catalog',
      label: 'Mo quan ly san pham',
    },
  },
  pricing: {
    title: 'Bảng phí',
    description: 'CoreGate Cloud áp dụng mô hình phí đơn giản để bạn tập trung vào việc bán sản phẩm.',
    sections: [
      'Phí nền tảng được tính theo từng đơn hàng thành công.',
      'Không thu phí đăng sản phẩm.',
      'Phí cổng thanh toán (VNPAY) áp dụng theo chính sách từ nhà cung cấp.',
      'Gói hỗ trợ từ xa: từ 300.000đ / buổi (60-90 phút), áp dụng cho hỗ trợ cài đặt, fix lỗi và tư vấn kỹ thuật.',
      'Dịch vụ code dự án theo yêu cầu: báo giá riêng theo phạm vi và timeline (từ 5.000.000đ / dự án).',
      'Bạn có thể tối ưu lợi nhuận bằng cách đóng gói combo và cập nhật phiên bản trả phí.',
    ],
    primaryCta: {
      href: '/contact',
      label: 'Liên hệ tư vấn phí',
    },
  },
  about: {
    title: 'Về CoreGate Cloud',
    description: 'CoreGate Cloud là nền tảng giúp creator và developer bán sản phẩm số an toàn và minh bạch.',
    sections: [
      'Tập trung vào các sản phẩm kỹ thuật số như source code, template, plugin và tài nguyên số.',
      'Tích hợp thanh toán VNPAY để đơn giản hóa quy trình mua hàng tại Việt Nam.',
      'Hỗ trợ dashboard theo dõi doanh thu, đơn hàng và lượt tải theo thời gian.',
    ],
    primaryCta: {
      href: '/browse',
      label: 'Khám phá sản phẩm',
    },
  },
  blog: {
    title: 'Blog',
    description: 'Nơi chia sẻ kinh nghiệm đóng gói sản phẩm, tối ưu mô tả và tăng doanh số bán digital product.',
    sections: [
      'Case study tăng conversion cho trang sản phẩm source code.',
      'Checklist trước khi publish một package trả phí.',
      'Kinh nghiệm hỗ trợ khách hàng sau khi bán source.',
    ],
    primaryCta: {
      href: '/browse',
      label: 'Xem marketplace',
    },
  },
  contact: {
    title: 'Liên hệ',
    description: 'Cần hỗ trợ xuất bản sản phẩm hoặc tích hợp thanh toán? Hãy liên hệ đội CoreGate.',
    sections: [
      'Email hỗ trợ: sangluonganm@gmail.com',
      'Số điện thoại: 0972282892',
      'Địa chỉ: Hà Nội, Việt Nam',
      'Dich vu ho tro tu xa: tu 300.000đ / buoi.',
      'Dich vu code du an theo yeu cau: bao gia rieng theo pham vi va tien do.',
      'Thời gian phản hồi mục tiêu: trong vòng 24 giờ làm việc.',
      'Khi liên hệ, vui lòng cung cấp mã đơn hàng hoặc tên sản phẩm để xử lý nhanh hơn.',
    ],
    primaryCta: {
      href: '/sellers',
      label: 'Xem hướng dẫn người bán',
    },
  },
  terms: {
    title: 'Điều khoản dịch vụ',
    description: 'Bằng việc sử dụng CoreGate Cloud, bạn đồng ý tuân thủ các điều khoản vận hành nền tảng.',
    sections: [
      'Người bán chịu trách nhiệm về bản quyền và tính hợp pháp của sản phẩm tải lên.',
      'Nghiêm cấm phát tán mã độc, nội dung vi phạm pháp luật hoặc nội dung xâm phạm quyền sở hữu trí tuệ.',
      'CoreGate Cloud có quyền tạm dừng sản phẩm/tài khoản khi phát hiện dấu hiệu vi phạm.',
    ],
    primaryCta: {
      href: '/privacy',
      label: 'Xem chính sách bảo mật',
    },
  },
  privacy: {
    title: 'Chính sách bảo mật',
    description: 'Chúng tôi cam kết bảo vệ dữ liệu cá nhân và thông tin giao dịch của người dùng.',
    sections: [
      'Chỉ thu thập dữ liệu cần thiết để vận hành tài khoản, thanh toán và hỗ trợ khách hàng.',
      'Không bán thông tin cá nhân cho bên thứ ba.',
      'Thông tin thanh toán được xử lý qua cổng thanh toán tích hợp, không lưu trực tiếp thẻ ngân hàng trên nền tảng.',
    ],
    primaryCta: {
      href: '/cookies',
      label: 'Xem chính sách cookie',
    },
  },
  cookies: {
    title: 'Chính sách cookie',
    description: 'Cookie được dùng để duy trì phiên đăng nhập, phân tích truy cập và cải thiện trải nghiệm.',
    sections: [
      'Cookie thiết yếu: phục vụ đăng nhập và bảo mật phiên.',
      'Cookie phân tích: đo hiệu năng trang và hành vi sử dụng ẩn danh.',
      'Bạn có thể chủ động tắt cookie trong trình duyệt, nhưng một số tính năng có thể không hoạt động đầy đủ.',
    ],
    primaryCta: {
      href: '/contact',
      label: 'Liên hệ hỗ trợ',
    },
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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-xl border border-border/40 bg-card/50 p-8 space-y-6">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-bold">{page.title}</h1>
          <p className="text-muted-foreground">{page.description}</p>
        </div>
        <div className="space-y-3">
          {page.sections.map((section) => (
            <p key={section} className="text-sm leading-relaxed text-muted-foreground">
              {section}
            </p>
          ))}
        </div>
        <div className="flex justify-center gap-3">
          <Link href="/">
            <Button variant="outline">Về trang chủ</Button>
          </Link>
          <Link href={page.primaryCta.href}>
            <Button>{page.primaryCta.label}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
