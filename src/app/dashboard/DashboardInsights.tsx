'use client'

import { useState } from 'react'
import { TrendingUp, Coins, BarChart3, Zap, ArrowUpRight, ArrowDownRight, LayoutDashboard, Lightbulb, X } from 'lucide-react'
import { cn } from '@/utils/cn'

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
      icon: <Coins className="h-4 w-4" />,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Yearly Projection',
      value: `$${totalYearly.toFixed(2)}`,
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    {
      label: 'Average cost',
      value: `$${averageCost.toFixed(2)}`,
      icon: <BarChart3 className="h-4 w-4" />,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
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
          
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Spending Insights</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-secondary transition-colors hover:bg-secondary/10 hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Stats */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-2">
                {stats.map((stat, i) => (
                  <div key={i} className="flex flex-col justify-center rounded-2xl border border-border/50 bg-secondary/5 p-4 transition-all hover:bg-secondary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("p-1.5 rounded-lg", stat.bg, stat.color)}>
                        {stat.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">{stat.label}</span>
                    </div>
                    <p className="text-xl font-black text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Highlight Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Most Expensive */}
                <div className="rounded-2xl border border-border/50 bg-orange-500/5 p-4 relative overflow-hidden group">
                  <ArrowUpRight className="absolute -right-2 -top-2 h-12 w-12 text-orange-500/10 transition-transform group-hover:scale-110" />
                  <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                    <Zap className="h-3 w-3" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Premium</span>
                  </div>
                  {mostExpensive ? (
                    <>
                      <p className="text-sm font-bold text-foreground truncate">{mostExpensive.subscription_name}</p>
                      <p className="text-xs font-semibold text-orange-500">${Number(mostExpensive.cost).toFixed(2)}/mo</p>
                    </>
                  ) : (
                    <p className="text-xs text-secondary">No data</p>
                  )}
                </div>

                {/* Best Value */}
                <div className="rounded-2xl border border-border/50 bg-green-500/5 p-4 relative overflow-hidden group">
                  <ArrowDownRight className="absolute -right-2 -top-2 h-12 w-12 text-green-500/10 transition-transform group-hover:scale-110" />
                  <div className="flex items-center gap-1.5 text-green-500 mb-1">
                    <LayoutDashboard className="h-3 w-3" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Value</span>
                  </div>
                  {cheapest ? (
                    <>
                      <p className="text-sm font-bold text-foreground truncate">{cheapest.subscription_name}</p>
                      <p className="text-xs font-semibold text-green-500">${Number(cheapest.cost).toFixed(2)}/mo</p>
                    </>
                  ) : (
                    <p className="text-xs text-secondary">No data</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tip Banner */}
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-primary/5 p-3 px-4 border border-primary/10">
              <div className="flex shrink-0 h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Lightbulb className="h-4 w-4" />
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                You have <span className="font-bold text-foreground">{activeSubs.length} active</span> subscriptions. 
                {activeSubs.length > 5 
                  ? " Try reviewing services to lower your yearly spend." 
                  : " You're managing your recurring costs effectively!"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
