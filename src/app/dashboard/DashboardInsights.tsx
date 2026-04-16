'use client'

import { useState } from 'react'
import { TrendingUp, Coins, BarChart3, Zap, ArrowUpRight, ArrowDownRight, LayoutDashboard, Lightbulb, X } from 'lucide-react'

interface Subscription {
  id: string
  subscription_name: string
  cost: number
  currency: string
  status: 'active' | 'disabled' | 'expired' | 'restored'
}

interface Props {
  subscriptions: Subscription[]
}

export function DashboardInsights({ subscriptions }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  // Filter for active subscriptions only for insights
  const activeSubs = subscriptions.filter(s => s.status === 'active')
  const totalMonthly = activeSubs.reduce((sum, s) => sum + Number(s.cost), 0)
  const totalYearly = totalMonthly * 12
  const averageCost = activeSubs.length > 0 ? totalMonthly / activeSubs.length : 0

  const sortedByCost = [...activeSubs].sort((a, b) => Number(b.cost) - Number(a.cost))
  const mostExpensive = sortedByCost[0]
  const cheapest = sortedByCost[sortedByCost.length - 1]

  const stats = [
    {
      label: 'Monthly Spend',
      value: `$${totalMonthly.toFixed(2)}`,
      icon: <Coins className="h-4 w-4" />
    },
    {
      label: 'Yearly Projection',
      value: `$${totalYearly.toFixed(2)}`,
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      label: 'Average cost',
      value: `$${averageCost.toFixed(2)}`,
      icon: <BarChart3 className="h-4 w-4" />
    }
  ]

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-secondary transition-all hover:bg-secondary/10 hover:text-foreground active:scale-95"
      >
        <TrendingUp className="h-4 w-4" />
        Insights
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="border-b border-border/80 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-foreground">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">Spending Insights</h2>
                    <p className="mt-1 text-sm text-secondary">A quick breakdown of your active subscription costs.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-secondary transition-colors hover:bg-secondary/10 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-border/70 bg-secondary/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-secondary">Active Subs</p>
                  <p className="mt-2 text-2xl font-black text-foreground">{activeSubs.length}</p>
                </div>
                {stats.map((stat, i) => (
                  <div key={i} className="rounded-2xl border border-border/70 bg-secondary/5 p-4 transition-colors hover:bg-secondary/10">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-secondary/15 p-1.5 text-foreground">
                        {stat.icon}
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-secondary">{stat.label}</p>
                    </div>
                    <p className="mt-2 text-xl font-black text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-secondary/5 p-4">
                  <ArrowUpRight className="absolute -right-3 -top-3 h-14 w-14 text-white/5" />
                  <div className="flex items-center gap-2 text-secondary">
                    <Zap className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Highest Cost</span>
                  </div>
                  {mostExpensive ? (
                    <>
                      <p className="mt-2 truncate text-base font-bold text-foreground">{mostExpensive.subscription_name}</p>
                      <p className="text-sm font-semibold text-foreground">${Number(mostExpensive.cost).toFixed(2)}/mo</p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-secondary">No active subscriptions yet.</p>
                  )}
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-secondary/5 p-4">
                  <ArrowDownRight className="absolute -right-3 -top-3 h-14 w-14 text-white/5" />
                  <div className="flex items-center gap-2 text-secondary">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Lowest Cost</span>
                  </div>
                  {cheapest ? (
                    <>
                      <p className="mt-2 truncate text-base font-bold text-foreground">{cheapest.subscription_name}</p>
                      <p className="text-sm font-semibold text-foreground">${Number(cheapest.cost).toFixed(2)}/mo</p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-secondary">No active subscriptions yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-secondary/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-foreground">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-relaxed text-secondary">
                    You have <span className="font-bold text-foreground">{activeSubs.length} active</span> subscriptions.
                    {activeSubs.length > 5
                      ? ' Consider reviewing underused services to reduce your yearly spend.'
                      : ' Your subscription list looks manageable right now.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border/80 px-6 py-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/10 sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
