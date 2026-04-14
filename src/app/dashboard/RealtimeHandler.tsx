'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export function RealtimeHandler({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const notifiedIds = new Set<string>()

    const checkExpirations = async () => {
      const now = new Date()
      const oneMinuteFromNow = new Date(now.getTime() + 60000)

      const { data } = await supabase
        .from('active_subscriptions')
        .select('id, subscription_name, expiration_date')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('expiration_date', now.toISOString())
        .lt('expiration_date', oneMinuteFromNow.toISOString())

      data?.forEach((sub) => {
          const renewalTime = new Date(sub.expiration_date)
          const timeLabel = isNaN(renewalTime.getTime()) ? 'N/A' : renewalTime.toLocaleTimeString()
          
          toast.warning(`Expiring Soon: ${sub.subscription_name}`, {
            description: `Renews at ${timeLabel}`,
            duration: 60000, // Stay for 1 minute
          })
          notifiedIds.add(sub.id)
        }
      })
    }

    const interval = setInterval(checkExpirations, 30000) // Check every 30s
    checkExpirations()

    // 1. Listen for changes in active_subscriptions
    const activeSub = supabase
      .channel('active_subs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Real-time change detected in active_subscriptions:', payload)
          router.refresh()
          
          if (payload.eventType === 'INSERT') {
            toast.success(`${payload.new.subscription_name} added`)
          } else if (payload.eventType === 'DELETE') {
            // Only toast if it was a soft delete (this might be hard to detect here without extra payload)
            // But router.refresh() will update the UI
          }
        }
      )
      .subscribe()

    // 2. Listen for changes in expired_subscriptions
    const expiredSub = supabase
      .channel('expired_subs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'expired_subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Real-time expiration detected:', payload)
          toast.error(`${payload.new.subscription_name} has expired!`, {
            duration: 10000,
          })
          router.refresh()
        }
      )
      .subscribe()

    // 3. Listen for changes in deleted_subscriptions
    const deletedSub = supabase
      .channel('deleted_subs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deleted_subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(activeSub)
      supabase.removeChannel(expiredSub)
      supabase.removeChannel(deletedSub)
    }
  }, [supabase, userId, router])

  return null
}
