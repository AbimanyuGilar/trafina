'use client'

import NextTopLoader from 'nextjs-toploader';
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* NextTopLoader otomatis menangani App Router tanpa setup tambahan */}
      <NextTopLoader 
        color="#2563eb"
        initialPosition={0.08}
        crawlSpeed={200}
        height={4}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={200}
        zIndex={99999}
      />
      {children}  
      <Toaster richColors position="top-left" />
    </>
  );
}