import Link from 'next/link';
import LoginForm from './LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Trafina - Login",
}

export default function LoginPage(): React.ReactElement {
  return (
    <>
      {/* Form Header */}
      <div className="mb-8 text-left">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Selamat Datang Kembali
        </h1>
        <p className="text-slate-500 text-sm">
          Masukkan kredensial Anda untuk mengakses akun.
        </p>
      </div>

      {/* Form Login */}
      <LoginForm />

      {/* Footer Navigasi */}
      <div className="mt-8 pt-6 border-t border-slate-200/80 text-center text-xs text-slate-600">
        Belum punya akun?{' '}
        <Link
          href="/register"
          className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 ml-1"
        >
          Daftar di sini.
        </Link>
      </div>
    </>
  );
}