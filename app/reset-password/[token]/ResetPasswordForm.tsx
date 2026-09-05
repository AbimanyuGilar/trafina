'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lock, ArrowRight, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const ResetPasswordForm = ({ token, callbackURL }: { token: string; callbackURL: string }) => {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isSuccess, setIsSuccess] = useState(false)

  const passwordsMatch = newPassword === confirmPassword || confirmPassword === ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok.')
      toast.error('Konfirmasi password tidak cocok.')
      return
    }

    setIsLoading(true)
    setErrorMessage(undefined)

    const { error } = await authClient.resetPassword({
      newPassword,
      token,
    })

    if (error) {
      setIsLoading(false)
      setErrorMessage(error.message)
      toast.error(error.message)
      return
    }

    setIsLoading(false)
    setIsSuccess(true)
    toast.success('Password berhasil direset!')

    setTimeout(() => {
      router.push(callbackURL)
    }, 2000)
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
            Password Berhasil Diubah
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Kamu akan dialihkan ke halaman login dalam beberapa saat.
          </p>
        </div>

        <Link
          href={callbackURL}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 group"
        >
          <span>Login Sekarang</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Reset Password
        </h1>
        <p className="text-sm text-slate-600">
          Masukkan password baru kamu di bawah ini.
        </p>
      </div>

      {errorMessage && (
        <div className="text-left rounded-lg p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Password Baru
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Konfirmasi Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
              !passwordsMatch
                ? 'border-red-300 focus:ring-red-600/20 focus:border-red-600'
                : 'border-slate-200 focus:ring-blue-600/20 focus:border-blue-600'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {!passwordsMatch && (
          <p className="text-xs text-red-600 mt-1.5">Konfirmasi password tidak cocok.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !passwordsMatch || !newPassword || !confirmPassword}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 group cursor-pointer disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mereset...</span>
          </>
        ) : (
          <>
            <span>Reset Password</span>
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

export default ResetPasswordForm
