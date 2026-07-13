import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { NewsletterPopup } from '@/components/layout/NewsletterPopup';
import { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col w-full bg-background font-sans">
      <Navigation />
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>
      <Footer />
      <NewsletterPopup />
    </div>
  );
}
