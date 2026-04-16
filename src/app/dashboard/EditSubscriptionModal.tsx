'use client'

import { useState, useTransition } from 'react'
import { Pencil, X, Loader2, Link2, Calendar, DollarSign, Globe, Sparkles } from 'lucide-react'
import { updateSubscription } from './actions'

interface Subscription {
  id: string
  subscription_name: string
  website_link?: string
  expiration_date: string
  cost: number
  currency: string
}

interface Props {
  subscription: Subscription
}

export function EditSubscriptionModal({ subscription }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      try {
        await updateSubscription(subscription.id, formData)
        setIsOpen(false)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
      }
    })
  }

  const getDomain = (url?: string) => {
    if (!url) return null
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
      return parsed.hostname
    } catch {
      return null
    }
  }

  const domain = getDomain(subscription.website_link)
  const logoUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/10"
      >
        <Pencil className="h-4 w-4" /> Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-lg animate-in fade-in duration-200"
            onClick={() => !isPending && setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            
            {/* Glow effect */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-primary/30 via-primary/5 to-transparent blur-sm" />

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] shadow-2xl">
              
              {/* Header */}
              <div className="relative px-6 pt-6 pb-5 border-b border-white/8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Logo */}
                    <div className="relative">
                      {logoUrl ? (
                        <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 p-2 flex items-center justify-center">
                          <img src={logoUrl} className="h-8 w-8 object-contain" alt="" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-2xl border border-primary/20 bg-primary/10 flex items-center justify-center">
                          <span className="text-xl font-black text-primary">
                            {subscription.subscription_name?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center border-2 border-[#0d0d0d]">
                        <Pencil className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-primary/80 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" /> Editing
                      </p>
                      <h2 className="text-xl font-black text-white leading-tight">
                        {subscription.subscription_name}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="h-8 w-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form action={handleSubmit} className="px-6 py-5 space-y-4">
                
                {error && (
                  <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-3.5 text-sm text-red-400 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Name + Website row */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Name */}
                  <div className="group sm:col-span-2">
                    <label htmlFor="edit_name" className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">
                      Subscription Name
                    </label>
                    <div className="relative">
                      <input
                        required
                        name="subscription_name"
                        id="edit_name"
                        defaultValue={subscription.subscription_name}
                        placeholder="e.g. Netflix, Spotify"
                        className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-primary/50 focus:bg-white/8 focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div className="group sm:col-span-2">
                    <label htmlFor="edit_website" className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">
                      Website Link
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                      <input
                        name="website_link"
                        id="edit_website"
                        defaultValue={subscription.website_link || ''}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-white/8 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-primary/50 focus:bg-white/8 focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  {/* Expiration */}
                  <div className="group">
                    <label htmlFor="edit_expiry" className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">
                      Next Renewal
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
                      <input
                        required
                        type="datetime-local"
                        name="expiration_date"
                        id="edit_expiry"
                        defaultValue={new Date(subscription.expiration_date).toISOString().slice(0, 16)}
                        className="w-full rounded-xl border border-white/8 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white outline-none transition-all focus:border-primary/50 focus:bg-white/8 focus:ring-1 focus:ring-primary/30 [color-scheme:dark]"
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] leading-snug text-primary/70 font-medium flex items-center gap-1">
                      <span className="inline-block h-1 w-1 rounded-full bg-primary/70" />
                      Alert sent 1 min before this time
                    </p>
                  </div>

                  {/* Cost */}
                  <div className="group">
                    <label htmlFor="edit_cost" className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">
                      Monthly Cost
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                      <input
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        name="cost"
                        id="edit_cost"
                        defaultValue={subscription.cost}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-white/8 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-primary/50 focus:bg-white/8 focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  {/* Currency */}
                  <div className="group sm:col-span-2">
                    <label htmlFor="edit_currency" className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">
                      Currency
                    </label>
                    <div className="relative">
                      <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
                      <select
                        name="currency"
                        id="edit_currency"
                        defaultValue={subscription.currency}
                        className="w-full appearance-none rounded-xl border border-white/8 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white outline-none transition-all focus:border-primary/50 focus:bg-white/8 focus:ring-1 focus:ring-primary/30 [color-scheme:dark]"
                      >
                        <option value="USD">USD ($) — US Dollar</option>
                        <option value="EUR">EUR (€) — Euro</option>
                        <option value="GBP">GBP (£) — British Pound</option>
                        <option value="INR">INR (₹) — Indian Rupee</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/8 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-95 disabled:opacity-50"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
