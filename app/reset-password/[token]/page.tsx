import AuthLayout from '@/app/(auth)/layout'
import ResetPasswordForm from './ResetPasswordForm'

export const metadata = {
  title: 'Trafina - Reset Password',
}

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ callbackURL?: string }>
}) => {
  const { token } = await params
  const { callbackURL } = await searchParams

  return (
    <AuthLayout>
      <ResetPasswordForm
        token={token}
        callbackURL={callbackURL || `${process.env.NEXT_PUBLIC_APP_URL}/login`}
      />
    </AuthLayout>
  )
}

export default page
