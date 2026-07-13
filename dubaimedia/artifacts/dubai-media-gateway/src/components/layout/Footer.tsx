import { Link } from 'wouter';

export function Footer() {
  return (
    <footer
      className="w-full"
      style={{ background: 'radial-gradient(ellipse 90% 100% at 72% 45%, #C8E4F2 0%, #5B9AC4 38%, #2E6F9E 75%, #1C5480 100%)' }}
    >
      <div className="container mx-auto px-6 md:px-10 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">

          {/* Credits — larger, white, clear */}
          <div>
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Dubai Films & Games Commission
            </p>
            <p className="text-base font-light leading-relaxed text-white max-w-lg">
              Dubai Media Gateway is operated by{' '}
              <span className="font-semibold text-white">hobb</span>{' '}
              <span className="font-semibold" style={{ color: '#FF6B6B' }}>حب</span>{' '}
              Media, in partnership with the Dubai Films and Games Commission{' '}
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>(proposed).</span>
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-8 flex-shrink-0">
            {[
              { label: 'Guidelines', path: '/permits' },
              { label: 'Membership', path: '/membership' },
            ].map(({ label, path }) => (
              <Link
                key={path}
                href={path}
                className="link-shine text-[11px] font-medium tracking-[0.16em] uppercase"
                style={{ '--link-tracking': '0.16em', color: 'rgba(255,255,255,0.55)' } as React.CSSProperties}
              >
                {label}
              </Link>
            ))}
            <a
              href="mailto:contact@dubaimediagateway.ae"
              className="link-shine text-[11px] font-medium tracking-[0.16em] uppercase"
              style={{ '--link-tracking': '0.16em', color: 'rgba(255,255,255,0.55)' } as React.CSSProperties}
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Bottom rule + copyright */}
        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
          <p className="text-[11px] font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>
            © 2026 Dubai Media Gateway. All rights reserved.
          </p>
          <p className="text-[11px] font-light" style={{ color: 'rgba(255,255,255,0.45)' }}>
            A hobb حب Media initiative
          </p>
        </div>
      </div>
    </footer>
  );
}
