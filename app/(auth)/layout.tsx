import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Outer Container / Card Utama */}
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0 md:min-h-[600px]">
        
        {/* Kolom Kiri: Visual Branding & Editorial Content (Asimetri Dinamis) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100/50 p-8 md:p-10 flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/80">
          <div className='h-full flex flex-col justify-center'>
            {/* Title dengan Tipografi Berkarakter */}
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug mb-4">
              LOREM IPSUM
            </h2>
            
            <p className="text-slate-600 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint eum enim temporibus totam reiciendis magni possimus ipsa, eligendi fuga aperiam ab, assumenda neque nisi nemo. Impedit excepturi necessitatibus facilis quis.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/60">
            <p className="text-xs text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} 3Brothers.exe.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Area Form yang dinamis (children) */}
        <div className="col-span-12 md:col-span-7 p-6 sm:p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}