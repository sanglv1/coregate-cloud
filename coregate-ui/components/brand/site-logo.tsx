import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SiteLogoProps {
  variant?: 'full' | 'icon';
  /** Bật link về trang chủ. Mặc định true. */
  linked?: boolean;
  className?: string;
  priority?: boolean;
}

export function SiteLogo({
  variant = 'full',
  linked = true,
  className,
  priority = false,
}: SiteLogoProps) {
  const src = variant === 'icon' ? '/icon.svg' : '/logo.svg';
  const width = variant === 'icon' ? 32 : 220;
  const height = variant === 'icon' ? 32 : 40;
  const alt = 'CoreGate Cloud';

  const image = (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn(
        variant === 'icon' ? 'h-8 w-8 rounded-full' : 'h-9 w-auto max-w-[200px] sm:max-w-[220px]',
        className,
      )}
      priority={priority}
    />
  );

  if (!linked) {
    return <span className="inline-flex shrink-0 items-center">{image}</span>;
  }

  return (
    <Link href="/" className="inline-flex shrink-0 items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/50 rounded-lg">
      {image}
    </Link>
  );
}
