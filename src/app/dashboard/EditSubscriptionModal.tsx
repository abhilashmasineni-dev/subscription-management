'use client'

import { useState, useTransition } from 'react'
import { Pencil, X, Loader2 } from 'lucide-react'
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
        setError((e as any).message || 'Something went wrong')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/10"
      >
        <Pencil className="h-4 w-4" /> Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => !isPending && setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground">Edit Subscription</h2>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="rounded-full p-1 text-secondary hover:bg-secondary/10 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <form
              action={handleSubmit}
              className="mt-6 space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="subscription_name" className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Subscription Name
                  </label>
                  <input
                    required
                    name="subscription_name"
                    id="subscription_name"
                    defaultValue={subscription.subscription_name}
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="website_link" className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Website Link (Optional)
                  </label>
                  <input
                    name="website_link"
                    id="website_link"
                    defaultValue={subscription.website_link}
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="expiration_date" className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Next Expiration / Renewal
                  </label>
                  <input
                    required
                    type="datetime-local"
                    name="expiration_date"
                    id="expiration_date"
                    defaultValue={new Date(subscription.expiration_date).toISOString().slice(0, 16)}
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="cost" className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Monthly Cost
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2 text-secondary">$</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      name="cost"
                      id="cost"
                      defaultValue={subscription.cost}
                      className="block w-full rounded-lg border border-border bg-background pl-7 pr-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="currency" className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Currency
                  </label>
                  <select
                    name="currency"
                    id="currency"
                    defaultValue={subscription.currency}
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
