'use client'

import { useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { RotateCcw, X, Loader2, AlertCircle, History } from 'lucide-react'
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
        setError(e instanceof Error ? e.message : 'Something went wrong')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/10"
      >
        <RotateCcw className="h-4 w-4" /> Restore
      </button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              onClick={() => !isPending && setIsOpen(false)}
            />

            <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border/70 bg-card p-0 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="border-b border-border/80 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-foreground">
                      <RotateCcw className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-foreground">Restore Subscription</h2>
                      <p className="mt-1 text-sm text-secondary">This will move the item back to your active subscriptions.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="absolute right-5 top-5 rounded-full p-1.5 text-secondary transition-colors hover:bg-secondary/10 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 px-6 py-6">
                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="rounded-2xl border border-border/80 bg-background/40 p-4">
                  <p className="text-sm text-secondary">
                    You are about to restore{' '}
                    <span className="font-semibold text-foreground">{subscription.subscription_name}</span>.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-wider text-secondary">
                    <History className="h-3.5 w-3.5" />
                    <span>Source: {source === 'expired' ? 'Expired' : 'Deleted'} list</span>
                  </div>
                </div>

                {source === 'expired' && (
                  <div className="rounded-2xl border border-border/70 bg-secondary/5 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground">Important for expired items</p>
                    <p className="text-sm text-secondary">
                      Restoring an expired item will move it back to Active. You should update the expiration date via Edit after restoring.
                    </p>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 border-t border-border/80 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmit()}
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Restoring...
                      </>
                    ) : (
                      'Restore Now'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
