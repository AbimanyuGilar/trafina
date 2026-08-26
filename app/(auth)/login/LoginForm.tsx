'use client'

import { useState, ChangeEvent, SubmitEvent } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { login } from '../actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginForm = () => {
	const router = useRouter()
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string>()

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    setIsLoading(true)
    
    const { error } = await authClient.signIn.email({
      ...formData,
      callbackURL: '/dashboard'
    })

    if (error) {
      setIsLoading(false)
			setErrorMessage(error.message)
      return
    }

    toast.success("Berhasil login.")
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" method="POST">
			{
				errorMessage && (
					<div className="text-left rounded-lg p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200">
						{errorMessage}
					</div>
				)
			}
			{/* Input Email */}
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
						name="email"
						required
						value={formData.email}
						onChange={handleChange}
						placeholder="nama@toko.com"
						className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
					/>
				</div>
			</div>

			{/* Input Password */}
			<div>
				<div className="flex items-center justify-between mb-2">
					<label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
						Kata Sandi
					</label>
					<Link
						href="/forgot-password"
						className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
					>
						Lupa password?
					</Link>
				</div>
				
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
						<Lock className="w-4 h-4" />
					</div>
					<input
						type={showPassword ? 'text' : 'password'}
						name="password"
						required
						value={formData.password}
						onChange={handleChange}
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

			{/* Checkbox Ingat Saya */}
			<div className="flex items-center pt-1">
				<input
					id="rememberMe"
					name="rememberMe"
					type="checkbox"
					checked={formData.rememberMe}
					onChange={handleChange}
					className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
				/>
				<label htmlFor="rememberMe" className="ml-2 block text-xs text-slate-600">
					Ingat saya di perangkat ini
				</label>
			</div>

			{/* Submit Button */}
			{
				isLoading
				? (
					<button
						disabled
						className="w-full mt-2 bg-blue-200 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 group"
					>
						<Loader2 className='animate-spin' />
					</button>
				)
				: (
					<button
						type="submit"
						className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 group"
					>
						<span>Masuk ke Akun</span>
						<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
					</button>
				)
			}
			
		</form>
  )
}

export default LoginForm