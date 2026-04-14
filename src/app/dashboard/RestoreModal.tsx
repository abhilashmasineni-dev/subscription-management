'use client'

import { useState, useTransition } from 'react'
import { RotateCcw, X, Loader2 } from 'lucide-react'
import { restoreSubscription } from './actions'

interface Subscription {
  id: string
  subscription_name: string
  expiration_date: string
  cost: number
  currency: string
}

interface Props {
  subscription: Subscription
  source: 'expired' | 'deleted'
}

export function RestoreModal({ subscription, source }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    startTransition(async () => {
      try {
        await restoreSubscription(subscription.id, source)
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
        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/10"
      >
        <RotateCcw className="h-4 w-4" /> Restore
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => !isPending && setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground">Restore Subscription</h2>
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

            <div className="mt-6 space-y-4">
              <p className="text-sm text-secondary">
                Are you sure you want to restore <span className="font-bold text-foreground">{subscription.subscription_name}</span>?
              </p>
              
              {source === 'expired' && (
                <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Note for Expired Items</p>
                  <p className="text-sm text-secondary">
                    Restoring an expired item will move it back to Active. You should update the expiration date via Edit after restoring.
                  </p>
                </div>
              )}
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
                onClick={() => handleSubmit()}
                disabled={isPending}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  'Confirm Restoration'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
