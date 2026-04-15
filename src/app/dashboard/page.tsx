import { logout } from '../auth/actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, LayoutDashboard, Ban, History, Trash2, TrendingUp } from 'lucide-react'
import { DashboardInsights } from './DashboardInsights'
import { AddSubscriptionModal } from './AddSubscriptionModal'
import { SubscriptionCard } from './SubscriptionCard'
import { RealtimeHandler } from './RealtimeHandler'
import { cn } from '@/utils/cn'

interface Subscription {
  id: string
  subscription_name: string
  website_link?: string
  expiration_date: string
  cost: number
  currency: string
  status: 'active' | 'disabled' | 'expired' | 'restored'
  deleted_at?: string
  expired_at?: string
}

export default async function DashboardPage(props: {
  searchParams: Promise<{ tab?: string; sortBy?: string; order?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const {
    data: userData,
  } = await supabase.auth.getUser()

  if (!userData.user) {
    redirect('/login')
  }

  const user = userData.user
  const currentTab = (searchParams.tab || 'active') as 'active' | 'disabled' | 'expired' | 'deleted'
  const sortBy = searchParams.sortBy || (currentTab === 'active' || currentTab === 'disabled' ? 'expiration_date' : 'created_at')
  const sortOrder = searchParams.order === 'desc' ? false : true

  // Fetch subscriptions based on tab
  let subscriptions: Subscription[] = []
  let activeSubscriptions: Subscription[] = []
  let totalSpending = 0
  let isTableMissing = false

  try {
    if (currentTab === 'active' || currentTab === 'disabled') {
      const { data, error } = await supabase
        .from('active_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', currentTab)
        .order(sortBy, { ascending: sortOrder })
      
      if (error && (error.code === 'PGRST116' || error.message.includes('not found') || error.message.includes('does not exist'))) {
        isTableMissing = true
      }
      subscriptions = data || []
      
      // Calculate total spending
      if (currentTab === 'active') {
        totalSpending = subscriptions.reduce((sum, sub) => sum + Number(sub.cost), 0)
      } else {
        const { data: activeData } = await supabase
          .from('active_subscriptions')
          .select('cost')
          .eq('user_id', user.id)
          .eq('status', 'active')
        totalSpending = activeData?.reduce((sum, sub) => sum + Number(sub.cost), 0) || 0
      }
    } else if (currentTab === 'expired') {
      const { data, error } = await supabase
        .from('expired_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'expired')
        .order('expired_at', { ascending: false })
      
      if (error && error.message.includes('does not exist')) isTableMissing = true
      subscriptions = data || []
    } else if (currentTab === 'deleted') {
      const { data, error } = await supabase
        .from('deleted_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('deleted_at', { ascending: false })
      
      if (error && error.message.includes('does not exist')) isTableMissing = true
      subscriptions = data || []
    }

    // Always fetch active subscriptions for Insights summary
    const { data: insightsData } = await supabase
      .from('active_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
    
    activeSubscriptions = insightsData || []
    totalSpending = activeSubscriptions.reduce((sum, sub) => sum + Number(sub.cost), 0)
  } catch (err) {
    console.error('Dashboard fetch error:', err)
  }

  const tabs = [
    { id: 'active', label: 'Active', icon: LayoutDashboard },
    { id: 'disabled', label: 'Paused', icon: Ban },
    { id: 'expired', label: 'Expired', icon: History },
    { id: 'deleted', label: 'Deleted', icon: Trash2 },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RealtimeHandler userId={user.id} />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              SubTracker
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Monthly Spending
              </span>
              <span className="text-lg font-bold text-foreground">
                ${totalSpending.toFixed(2)}
              </span>
            </div>
            
            <div className="h-8 w-px bg-border" />

            <form action={logout}>
              <button className="group flex items-center gap-2 rounded-xl p-2 text-secondary transition-all hover:bg-red-500/10 hover:text-red-500">
                <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                <span className="sr-only">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="mt-2 text-lg text-secondary">
              Managing subscriptions for <span className="font-medium text-foreground">{user.email}</span>
            </p>
          </div>
          <AddSubscriptionModal />
        </div>

        {/* Insights Section */}
        {!isTableMissing && activeSubscriptions.length > 0 && (
          <div className="mt-8">
            <DashboardInsights subscriptions={activeSubscriptions} />
          </div>
        )}


        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1 scrollbar-hide">
            {tabs.map((tab) => (
              <a
                key={tab.id}
                href={`/dashboard?tab=${tab.id}&sortBy=${sortBy}&order=${searchParams.order || 'asc'}`}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
                  currentTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-secondary hover:bg-secondary/10 hover:text-foreground'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-1">
            {[
              { id: 'subscription_name', label: 'Name' },
              { id: 'cost', label: 'Cost' },
              { id: 'expiration_date', label: 'Expiry' },
            ].map((option) => (
              <a
                key={option.id}
                href={`/dashboard?tab=${currentTab}&sortBy=${option.id}&order=${sortBy === option.id && !searchParams.order ? 'desc' : 'asc'}`}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
                  sortBy === option.id
                    ? 'bg-secondary text-white'
                    : 'text-secondary hover:bg-secondary/10 hover:text-foreground'
                )}
              >
                {option.label}
              </a>
            ))}
          </div>
        </div>

        {/* Subscriptions Grid */}
        {isTableMissing ? (
          <div className="mt-12 rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <Ban className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-foreground">Database Setup Required</h2>
            <p className="mx-auto mt-2 max-w-lg text-secondary">
              It looks like the required database tables haven&apos;t been created yet. Please run the SQL migration script in your Supabase Dashboard to enable subscription tracking.
            </p>
            <div className="mt-8 flex justify-center">
              <a 
                href="https://supabase.com/dashboard/project/_/sql"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
              >
                Go to Supabase SQL Editor
              </a>
            </div>
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} tab={currentTab} />
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-32 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary/10 text-secondary">
              <LayoutDashboard className="h-10 w-10 opacity-50" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-foreground">
              No {currentTab} subscriptions
            </h3>
            <p className="mt-2 text-secondary max-w-sm">
              {currentTab === 'active' 
                ? "Start tracking your recurring payments to stay on top of your finances."
                : `You don't have any ${currentTab} subscriptions at the moment.`}
            </p>
            {currentTab === 'active' && (
              <div className="mt-10">
                <AddSubscriptionModal />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-background py-10">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-secondary sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} SubTracker. Developed with precision.</p>
        </div>
      </footer>
    </div>
  )
}
