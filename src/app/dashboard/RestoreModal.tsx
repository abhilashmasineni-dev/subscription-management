'use client'

import { useTransition } from 'react'
import { RotateCcw, Loader2 } from 'lucide-react'
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
  const [isPending, startTransition] = useTransition()

  const handleRestore = () => {
    startTransition(async () => {
      try {
        await restoreSubscription(subscription.id, source)
      } catch (e: unknown) {
        console.error("Failed to restore:", e)
      }
    })
  }

  return (
    <button
      onClick={handleRestore}
      disabled={isPending}
      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/10 disabled:opacity-50"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} 
      {isPending ? 'Restoring...' : 'Restore'}
    </button>
  )
}
