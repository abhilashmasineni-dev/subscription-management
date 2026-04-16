import { login, signup } from '../auth/actions'
import { LogIn, UserPlus } from 'lucide-react'

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  const searchParams = await props.searchParams
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-120px] h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-130px] right-[-90px] h-[260px] w-[260px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl">
        <div className="grid md:grid-cols-2">
          <section className="hidden border-r border-border/70 bg-gradient-to-b from-primary/15 to-background p-8 md:flex md:flex-col md:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                SubTracker
              </p>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-foreground">Stay ahead of every renewal.</h1>
              <p className="mt-3 text-sm leading-relaxed text-secondary">
                Track costs, monitor expiration dates, and manage active, paused, expired, and deleted subscriptions in one place.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Why users love it</p>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                <li>- Real-time renewal alerts</li>
                <li>- Fast restore and edit workflows</li>
                <li>- Insights for monthly and yearly spend</li>
              </ul>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h2>
              <p className="mt-2 text-sm text-secondary">Sign in or create a new account to continue.</p>
            </div>

            {searchParams.error && (
              <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
                {searchParams.error}
              </div>
            )}

            <form className="mt-6 space-y-5">
              <div className="space-y-4 rounded-2xl border border-border/70 bg-background/40 p-4">
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
                    className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                    className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  formAction={login}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
                <button
                  formAction={signup}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary/10 focus:outline-none focus:ring-2 focus:ring-border"
                >
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-xs text-secondary md:text-left">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
