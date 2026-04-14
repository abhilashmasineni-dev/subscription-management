'use client'

import { useState } from 'react'
import { TrendingUp, Coins, BarChart3, X, Zap, ArrowUpRight, ArrowDownRight, LayoutDashboard } from 'lucide-react'

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

export function InsightsModal({ subscriptions }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  // Calculations
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
      sub: 'Current billing period',
      icon: <Coins className="h-5 w-5" />,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Yearly Projection',
      value: `$${totalYearly.toFixed(2)}`,
      sub: 'Estimated annual cost',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    {
      label: 'Average Subscription',
      value: `$${averageCost.toFixed(2)}`,
      sub: 'Per active service',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    }
  ]

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 active:scale-95"
      >
        <TrendingUp className="h-4 w-4" />
        Insights
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-orange-500/5 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-orange-500 p-2 text-white shadow-lg shadow-orange-500/30">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Spending Insights</h2>
                  <p className="text-sm text-secondary">Advanced analytics for your subscriptions</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-secondary transition-colors hover:bg-secondary/10 hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8">
              {/* Primary Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat, i) => (
                  <div key={i} className="rounded-3xl border border-border bg-background p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                    <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${stat.bg} ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-secondary">{stat.label}</p>
                    <h3 className="mt-1 text-2xl font-black text-foreground">{stat.value}</h3>
                    <p className="mt-1 text-[10px] text-secondary">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Advanced Insights */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {/* Most Expensive */}
                <div className="relative overflow-hidden rounded-3xl border border-border bg-background p-6">
                  <div className="absolute -right-4 -top-4 text-orange-500/10">
                    <ArrowUpRight className="h-24 w-24" />
                  </div>
                  <div className="flex items-center gap-2 text-orange-500">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Premium Choice</span>
                  </div>
                  <h4 className="mt-4 text-sm font-medium text-secondary">Most Expensive</h4>
                  {mostExpensive ? (
                    <div className="mt-1">
                      <div className="text-2xl font-black text-foreground">{mostExpensive.subscription_name}</div>
                      <div className="text-lg font-bold text-orange-500">${Number(mostExpensive.cost).toFixed(2)}/mo</div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-secondary">No active subscriptions</div>
                  )}
                </div>

                {/* Cheapest */}
                <div className="relative overflow-hidden rounded-3xl border border-border bg-background p-6">
                  <div className="absolute -right-4 -top-4 text-green-500/10">
                    <ArrowDownRight className="h-24 w-24" />
                  </div>
                  <div className="flex items-center gap-2 text-green-500">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Great Value</span>
                  </div>
                  <h4 className="mt-4 text-sm font-medium text-secondary">Best Value</h4>
                  {cheapest ? (
                    <div className="mt-1">
                      <div className="text-2xl font-black text-foreground">{cheapest.subscription_name}</div>
                      <div className="text-lg font-bold text-green-500">${Number(cheapest.cost).toFixed(2)}/mo</div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-secondary">No active subscriptions</div>
                  )}
                </div>
              </div>

              {/* Tip Section */}
              <div className="mt-8 rounded-3xl bg-secondary/5 p-6 border border-border/50">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-background text-foreground shadow-sm">
                    💡
                  </div>
                  <div>
                    <h5 className="font-bold text-foreground">Smart Tip</h5>
                    <p className="mt-1 text-sm text-secondary">
                      You have <span className="font-bold text-foreground">{activeSubs.length} active</span> subscriptions. 
                      {activeSubs.length > 5 ? " Consider reviewing services you haven't used recently to lower your yearly spend." : " You're doing a great job managing your recurring costs!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="bg-secondary/5 px-8 py-6 text-center border-t border-border">
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-foreground px-8 py-3 text-sm font-bold text-background transition-transform hover:scale-105"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
