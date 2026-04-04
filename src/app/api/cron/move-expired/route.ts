import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. Find expired subscriptions
    const now = new Date().toISOString()
    const { data: expiredSubs, error: fetchError } = await supabase
      .from('active_subscriptions')
      .select('*')
      .lt('expiration_date', now)

    if (fetchError) throw fetchError

    if (!expiredSubs || expiredSubs.length === 0) {
      return NextResponse.json({ moved: 0, message: 'No expired subscriptions' })
    }

    // 2. Move to expired_subscriptions
    const movedRecords = expiredSubs.map((sub) => ({
      user_id: sub.user_id,
      original_subscription_id: sub.id,
      subscription_name: sub.subscription_name,
      website_link: sub.website_link,
      start_date: sub.start_date,
      expiration_date: sub.expiration_date,
      cost: sub.cost,
      currency: sub.currency,
      status: 'expired',
      expired_at: now,
      can_restore_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }))

    const { error: insertError } = await supabase
      .from('expired_subscriptions')
      .insert(movedRecords)

    if (insertError) throw insertError

    // 3. Delete from active_subscriptions
    const { error: deleteError } = await supabase
      .from('active_subscriptions')
      .delete()
      .in('id', expiredSubs.map((s) => s.id))

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      moved: expiredSubs.length,
      timestamp: now,
    })
  } catch (error: any) {
    console.error('[CRON] Error moving expired subscriptions:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
