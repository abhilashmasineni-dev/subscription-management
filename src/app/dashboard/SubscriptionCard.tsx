'use client'

import { formatDistanceToNow, format } from 'date-fns'
import { ExternalLink, MoreVertical, Trash2, Pause, Play } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/utils/cn'
import { toggleSubscriptionStatus, softDeleteSubscription } from './actions'
import { EditSubscriptionModal } from './EditSubscriptionModal'
import { RestoreModal } from './RestoreModal'

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

interface Props {
  subscription: Subscription
  tab: 'active' | 'disabled' | 'expired' | 'deleted'
}

export function SubscriptionCard({ subscription, tab }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleToggleStatus = async () => {
    await toggleSubscriptionStatus(subscription.id, subscription.status)
    setIsMenuOpen(false)
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${subscription.subscription_name}?`)) {
      await softDeleteSubscription(subscription.id)
      setIsMenuOpen(false)
    }
  }

  const getSafeDateInfo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) throw new Error('Invalid Date')
      
      return {
        isExpired: date < new Date(),
        formattedDate: format(date, 'MMM d, p'),
        relativeTime: formatDistanceToNow(date, { addSuffix: true }),
        isValid: true
      }
    } catch {
      return {
        isExpired: false,
        formattedDate: 'N/A',
        relativeTime: 'unknown time',
        isValid: false
      }
    }
  }

  const { isExpired, formattedDate, relativeTime, isValid } = getSafeDateInfo(subscription.expiration_date)

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg',
        subscription.status === 'disabled' && 'opacity-60 grayscale-[0.5]'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-foreground">
              {subscription.subscription_name}
            </h3>
            {subscription.website_link && (
              <a
                href={subscription.website_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary transition-colors hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-secondary">
            <span className={cn(isExpired && isValid && 'text-red-500 font-medium')}>
              {isExpired ? 'Expired' : 'Renews'} {relativeTime}
            </span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg p-1.5 text-secondary transition-colors hover:bg-secondary/10 hover:text-foreground"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 origin-top-right rounded-xl border border-border bg-card py-1 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                {tab === 'active' || tab === 'disabled' ? (
                  <>
                    <EditSubscriptionModal subscription={subscription} />
                    <button
                      onClick={handleToggleStatus}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/10"
                    >
                      {subscription.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4" /> Disable
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" /> Re-enable
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </>
                ) : (
                  <RestoreModal subscription={subscription} source={tab === 'expired' ? 'expired' : 'deleted'} />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-secondary">
            Cost
          </p>
          <p className="text-2xl font-bold text-foreground">
            {subscription.currency === 'USD' ? '$' : subscription.currency}
            {subscription.cost}
            <span className="text-sm font-normal text-secondary">/mo</span>
          </p>
        </div>
        
        {subscription.status === 'disabled' && (
          <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary">
            Paused
          </span>
        )}
      </div>
    </div>
  )
}
