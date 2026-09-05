'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(undefined)

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })

    if (error) {
      setIsLoading(false)
      setErrorMessage(error.message)
      toast.error(error.message)
      return
    }

    setIsLoading(false)
    setIsSuccess(true)
    toast.success('Email reset password berhasil dikirim!')
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Email Terkirim
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Kami telah mengirimkan link reset password ke <span className="font-medium text-slate-900">{email}</span>.
            Silakan cek inbox atau spam folder kamu.
          </p>
        </div>

        <Link
          href="/login"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Kembali ke Login</span>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Lupa Password?
        </h1>
        <p className="text-sm text-slate-600">
          Masukkan alamat email kamu dan kami akan mengirimkan link untuk mereset password.
        </p>
      </div>

      {errorMessage && (
        <div className="text-left rounded-lg p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Alamat Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@toko.com"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 group cursor-pointer disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mengirim...</span>
          </>
        ) : (
          <>
            <span>Kirim Link Reset</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Kembali ke Login
        </Link>
      </div>
    </form>
  )
}

export default ForgotPasswordForm
