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
        formattedDate: format(date, 'EEEE, MMM d, yyyy • p'),
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
  const [logoError, setLogoError] = useState(false)

  const getDomain = (url?: string) => {
    if (!url) return null
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
      return parsed.hostname
    } catch {
      return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
    }
  }

  const domain = getDomain(subscription.website_link)
  const logoUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg',
        subscription.status === 'disabled' && 'opacity-60 grayscale-[0.5]'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-foreground truncate">
              {subscription.subscription_name}
            </h3>
            {subscription.website_link && (
              <a
                href={subscription.website_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary shrink-0 transition-colors hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          <div className="flex flex-col text-sm text-secondary">
            <span className={cn(isExpired && isValid && 'text-red-500 font-medium')}>
              {isExpired ? 'Expired' : 'Renews'} {relativeTime}
            </span>
            <span className="text-xs opacity-70">on {formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {domain && !logoError ? (
            <div className="relative group/logo">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl opacity-20 blur-sm transition-opacity group-hover/logo:opacity-40" />
              <img
                src={logoUrl!}
                onError={() => setLogoError(true)}
                className="relative h-10 w-10 rounded-xl border border-border/50 bg-white/5 object-contain p-1.5 shadow-sm transition-transform hover:scale-110"
                alt=""
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shadow-sm">
              <span className="text-lg font-bold text-primary">
                {subscription.subscription_name[0].toUpperCase()}
              </span>
            </div>
          )}

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
              <div className="absolute right-0 top-full z-20 mt-2 w-40 origin-top-right rounded-xl border border-border bg-card/80 backdrop-blur-md py-1 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
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
