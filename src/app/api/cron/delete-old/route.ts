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
    const now = new Date().toISOString()

    // 1. Delete old expired records
    const { error: expiredDeleteError } = await supabase
      .from('expired_subscriptions')
      .delete()
      .lt('can_restore_until', now)
      .eq('status', 'expired')

    if (expiredDeleteError) throw expiredDeleteError

    // 2. Delete old soft-deleted records
    const { error: deletedDeleteError } = await supabase
      .from('deleted_subscriptions')
      .delete()
      .lt('can_restore_until', now)

    if (deletedDeleteError) throw deletedDeleteError

    return NextResponse.json({
      success: true,
      timestamp: now,
    })
  } catch (error: unknown) {
    console.error('[CRON] Error deleting old records:', error)
    return NextResponse.json({ error: (error as any).message }, { status: 500 })
  }
}
