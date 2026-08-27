import AuthLayout from '@/app/(auth)/layout'
import ForgotPasswordForm from './ForgotPasswordForm'

export const metadata = {
  title: 'Trafina - Lupa Password',
}

const page = () => {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}

export default page
