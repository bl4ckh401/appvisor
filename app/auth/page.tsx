import { AuthForm } from "@/components/auth/auth-form"

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  )
}
