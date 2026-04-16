import { login } from '../auth/actions'
import { LogIn } from 'lucide-react'
import Link from 'next/link'

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  const searchParams = await props.searchParams
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-border/70 bg-card p-7 shadow-2xl sm:p-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">SubTracker</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
          <p className="mt-2 text-sm text-secondary">Sign in to your account to continue.</p>
        </div>

        {searchParams.error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
            {searchParams.error}
          </div>
        )}

        <form className="mt-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-secondary"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1.5 block w-full rounded-xl border border-border bg-[#0d0d0d] px-3 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-secondary"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1.5 block w-full rounded-xl border border-border bg-[#0d0d0d] px-3 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            formAction={login}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-foreground hover:underline">
            Sign up
          </Link>
        </p>

        <p className="mt-6 text-center text-xs text-secondary">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </section>
    </div>
  )
}
