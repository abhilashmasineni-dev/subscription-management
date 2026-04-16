'use client'

import { useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { Pencil, X, Loader2 } from 'lucide-react'
import { updateSubscription, validateWebsiteLink } from './actions'

interface Subscription {
  id: string
  subscription_name: string
  website_link?: string
  start_date?: string
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
  const [websiteLink, setWebsiteLink] = useState(subscription.website_link || '')
  const [websiteStatus, setWebsiteStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [websiteError, setWebsiteError] = useState<string | null>(null)

  const validateWebsiteFormat = (rawValue: string) => {
    const value = rawValue.trim()

    if (!value) {
      setWebsiteStatus('idle')
      setWebsiteError(null)
      return { isValid: true, normalizedUrl: '' }
    }

    try {
      const normalizedUrl = /^https?:\/\//i.test(value) ? value : `https://${value}`
      const parsedUrl = new URL(normalizedUrl)

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        setWebsiteStatus('invalid')
        setWebsiteError('Only HTTP and HTTPS website links are allowed.')
        return { isValid: false, normalizedUrl: '' }
      }

      setWebsiteStatus('valid')
      setWebsiteError(null)
      return { isValid: true, normalizedUrl: parsedUrl.toString() }
    } catch {
      setWebsiteStatus('invalid')
      setWebsiteError('Please enter a valid website URL.')
      return { isValid: false, normalizedUrl: '' }
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setError(null)

    const websiteValue = (formData.get('website_link') as string) || websiteLink
    const formatValidation = validateWebsiteFormat(websiteValue)
    if (!formatValidation.isValid) {
      setError('Please fix the website link before saving.')
      return
    }

    if (formatValidation.normalizedUrl) {
      formData.set('website_link', formatValidation.normalizedUrl)
      setWebsiteLink(formatValidation.normalizedUrl)
    }

    setWebsiteStatus('checking')
    setWebsiteError(null)

    const reachabilityValidation = await validateWebsiteLink(formatValidation.normalizedUrl || '')
    if (!reachabilityValidation.isValid) {
      setWebsiteStatus('invalid')
      setWebsiteError(reachabilityValidation.message || 'Website could not be reached.')
      setError('Please fix the website link before saving.')
      return
    }

    setWebsiteStatus('valid')

    if (reachabilityValidation.normalizedUrl) {
      formData.set('website_link', reachabilityValidation.normalizedUrl)
      setWebsiteLink(reachabilityValidation.normalizedUrl)
    }

    startTransition(async () => {
      try {
        await updateSubscription(subscription.id, formData)
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
        <Pencil className="h-4 w-4" /> Edit
      </button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              onClick={() => !isPending && setIsOpen(false)}
            />

            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Edit Subscription</h2>
                  <p className="mt-1 text-sm text-secondary">Update service details and billing schedule.</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="rounded-full p-1 text-secondary hover:bg-secondary/10 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mx-5 mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                  {error}
                </div>
              )}

              <form
                action={handleSubmit}
                className="space-y-6 px-5 py-6"
              >
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-[13px] font-semibold text-foreground">Basic Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="subscription_name" className="text-xs font-medium text-secondary">
                        Subscription Name
                      </label>
                      <input
                        required
                        name="subscription_name"
                        id="subscription_name"
                        defaultValue={subscription.subscription_name}
                        placeholder="e.g. Netflix, Spotify"
                        className="mt-1.5 block w-full rounded-xl border-0 bg-secondary/10 px-4 py-2.5 text-sm text-foreground placeholder:text-secondary/50 focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-border/40" />

                {/* Billing Schedule */}
                <div className="space-y-4">
                  <h3 className="text-[13px] font-semibold text-foreground">Billing Schedule</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="start_date" className="text-xs font-medium text-secondary">
                        Start Date
                      </label>
                      <input
                        required
                        type="date"
                        name="start_date"
                        id="start_date"
                        defaultValue={subscription.start_date || new Date().toISOString().split('T')[0]}
                        className="mt-1.5 block w-full rounded-xl border-0 bg-secondary/10 px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="expiration_date" className="text-xs font-medium text-secondary">
                        Next Renewal
                      </label>
                      <input
                        required
                        type="datetime-local"
                        name="expiration_date"
                        id="expiration_date"
                        defaultValue={new Date(subscription.expiration_date).toISOString().slice(0, 16)}
                        className="mt-1.5 block w-full rounded-xl border-0 bg-secondary/10 px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-border/40" />

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-[13px] font-semibold text-foreground">Pricing</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="website_link" className="text-xs font-medium text-secondary">
                        Website Link <span className="opacity-60">(Optional)</span>
                      </label>
                      <input
                        name="website_link"
                        id="website_link"
                        value={websiteLink}
                        onChange={(e) => {
                          setWebsiteLink(e.target.value)
                          if (websiteStatus !== 'idle') {
                            setWebsiteStatus('idle')
                            setWebsiteError(null)
                          }
                        }}
                        onBlur={() => {
                          validateWebsiteFormat(websiteLink)
                        }}
                        placeholder="https://..."
                        className={`mt-1.5 block w-full rounded-xl border-0 bg-secondary/10 px-4 py-2.5 text-sm text-foreground placeholder:text-secondary/50 focus:ring-2 transition-all ${
                          websiteStatus === 'invalid'
                            ? 'ring-2 ring-red-500/50'
                            : 'focus:ring-primary/50'
                        }`}
                      />
                      {websiteStatus === 'checking' && (
                        <p className="mt-1.5 text-xs text-secondary">Checking website...</p>
                      )}
                      {websiteError && (
                        <p className="mt-1.5 text-xs text-red-500">{websiteError}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="cost" className="text-xs font-medium text-secondary">
                        Monthly Cost
                      </label>
                      <div className="relative mt-1.5">
                        <span className="absolute left-4 top-2.5 text-sm text-secondary/70">$</span>
                        <input
                          required
                          type="number"
                          step="0.01"
                          min="0"
                          name="cost"
                          id="cost"
                          defaultValue={subscription.cost}
                          placeholder="0.00"
                          className="block w-full rounded-xl border-0 bg-secondary/10 pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-secondary/50 focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="currency" className="text-xs font-medium text-secondary">
                        Currency
                      </label>
                      <select
                        name="currency"
                        id="currency"
                        defaultValue={subscription.currency}
                        className="mt-1.5 block w-full rounded-xl border-0 bg-secondary/10 px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/50 transition-all"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || websiteStatus === 'checking' || websiteStatus === 'invalid'}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
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
          </div>,
          document.body
        )}
    </>
  )
}
