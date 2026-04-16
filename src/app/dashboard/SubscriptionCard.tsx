'use client'

import { formatDistanceToNow, format } from 'date-fns'
import { Share2, MoreVertical, Trash2, Pause, Play } from 'lucide-react'
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
        formattedDate: format(date, "EEEE,MMM d,yyyy.h:mm a"),
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

  const getSafeWebsiteUrl = (url?: string) => {
    if (!url) return null
    try {
      const normalized = url.startsWith('http') ? url : `https://${url}`
      const parsed = new URL(normalized)
      if (!['http:', 'https:'].includes(parsed.protocol)) return null
      return parsed.toString()
    } catch {
      return null
    }
  }

  const domain = getDomain(subscription.website_link)
  const websiteUrl = getSafeWebsiteUrl(subscription.website_link)
  const logoUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null

  return (
    <div
      className={cn(
        'group relative rounded-3xl border border-border bg-card px-6 pb-5 pt-6 transition-all hover:border-primary/40',
        subscription.status === 'disabled' && !isMenuOpen && 'opacity-60 grayscale-[0.5] hover:opacity-100',
        subscription.status === 'disabled' && isMenuOpen && 'grayscale-[0.5]'
      )}
    >
      {/* Top Section: Logo, Name, Share, Menu */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {domain && !logoError ? (
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl!}
                onError={() => setLogoError(true)}
                className="h-12 w-12 rounded-2xl bg-white/5 object-contain p-2"
                alt=""
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="text-xl font-bold">
                {subscription.subscription_name[0].toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="min-w-0 truncate text-[28px] font-bold font-serif tracking-tight text-foreground">
              {subscription.subscription_name?.toLowerCase() || 'unnamed'}
            </h3>
            {websiteUrl ? (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${subscription.subscription_name} website`}
                className="mt-1 rounded-full bg-black p-2 text-white shadow-md transition-colors hover:bg-black/80 ring-1 ring-white/10"
              >
                <Share2 className="h-4 w-4" strokeWidth={3} />
              </a>
            ) : (
              <span
                title="No valid website link"
                className="mt-1 cursor-not-allowed rounded-full bg-black p-2 text-white/40 shadow-md ring-1 ring-white/5"
              >
                <Share2 className="h-4 w-4" strokeWidth={3} />
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-full p-2 text-secondary transition-colors hover:bg-white/10 hover:text-white"
          >
            <MoreVertical className="h-6 w-6" />
          </button>


          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-40 origin-top-right rounded-xl border border-border bg-background py-1 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
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

      {/* Bottom Section: Cost and Renewal Info */}
      <div className="mt-12 flex items-end justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-serif uppercase tracking-[0.05em] text-foreground">COST</span>
          <div className="flex items-baseline font-serif">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {subscription.currency === 'USD' ? '$' : subscription.currency}
              {subscription.cost}
            </span>
            <span className="text-lg font-bold text-foreground">/mo</span>
          </div>
        </div>

        <div className="min-w-0 text-right font-serif">
          <p className={cn("truncate text-lg", isExpired && isValid ? 'text-red-500' : 'text-foreground')}>
            {isExpired ? 'Expired' : 'Renews'} {relativeTime}
          </p>
          <p className="truncate text-[15px] font-bold text-foreground">
            on {formattedDate.toLowerCase().replace(' am', ' AM').replace(' pm', ' PM')}
          </p>
        </div>
      </div>

    </div>
  )
}
