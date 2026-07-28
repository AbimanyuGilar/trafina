import Link from 'next/link';
import RegisterForm from './form';

export default function RegisterPage() {
  

  return (
    <>
      <div className="mb-8 text-left">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Buat Akun Baru
        </h1>
        <p className="text-slate-500 text-sm">
          Lengkapi data di bawah ini untuk mendaftar.
        </p>
      </div>

      <RegisterForm />

      <div className="mt-8 pt-6 border-t border-slate-200/80 text-center text-xs text-slate-600">
        Sudah memiliki akun?{' '}
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 ml-1"
        >
          Masuk di sini.
        </Link>
      </div>
    </>
  );
}