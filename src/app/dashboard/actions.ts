'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addSubscription(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const subscription = {
    user_id: user.id,
    subscription_name: formData.get('subscription_name') as string,
    website_link: formData.get('website_link') as string,
    start_date: formData.get('start_date') as string,
    expiration_date: formData.get('expiration_date') as string,
    cost: parseFloat(formData.get('cost') as string),
    currency: formData.get('currency') as string || 'USD',
    status: 'active',
  }

  if (isNaN(subscription.cost)) {
    throw new Error('Please enter a valid amount for the cost.')
  }

  const { error } = await supabase.from('active_subscriptions').insert(subscription)

  if (error) {
    console.error('Add subscription error:', error)
    if (error.code === '42P01') {
      throw new Error('Database table "active_subscriptions" not found. Please run the setup SQL.')
    }
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

export async function updateSubscription(id: string, formData: FormData) {
  const supabase = await createClient()

  const updates = {
    subscription_name: formData.get('subscription_name') as string,
    website_link: formData.get('website_link') as string,
    expiration_date: formData.get('expiration_date') as string,
    cost: parseFloat(formData.get('cost') as string),
    currency: formData.get('currency') as string || 'USD',
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('active_subscriptions')
    .update(updates)
    .eq('id', id)

  if (error) throw error

  revalidatePath('/dashboard')
}

export async function toggleSubscriptionStatus(id: string, currentStatus: string) {
  const supabase = await createClient()
  const newStatus = currentStatus === 'active' ? 'disabled' : 'active'

  const { error } = await supabase
    .from('active_subscriptions')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error

  revalidatePath('/dashboard')
}

export async function softDeleteSubscription(id: string) {
  const supabase = await createClient()

  try {
    // 1. Get original subscription
    const { data: sub, error: fetchError } = await supabase
      .from('active_subscriptions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(`Could not find the subscription: ${fetchError.message}`)

    // 2. Move to deleted_subscriptions
    const { error: insertError } = await supabase.from('deleted_subscriptions').insert({
      user_id: sub.user_id,
      original_subscription_id: sub.id,
      subscription_name: sub.subscription_name,
      website_link: sub.website_link,
      start_date: sub.start_date,
      expiration_date: sub.expiration_date,
      cost: sub.cost,
      currency: sub.currency,
      deleted_at: new Date().toISOString(),
      can_restore_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    if (insertError) throw new Error(`Could not move to trash: ${insertError.message}`)

    // 3. Delete from active_subscriptions
    const { error: deleteError } = await supabase
      .from('active_subscriptions')
      .delete()
      .eq('id', id)

    if (deleteError) throw new Error(`Could not remove from active list: ${deleteError.message}`)

    revalidatePath('/dashboard')
  } catch (err) {
    console.error('Delete error:', err)
    throw err instanceof Error ? err : new Error('An unexpected error occurred during deletion.')
  }
}

export async function restoreSubscription(originalId: string, source: 'expired' | 'deleted') {
  const supabase = await createClient()
  const table = source === 'expired' ? 'expired_subscriptions' : 'deleted_subscriptions'

  try {
    // 1. Get record
    const { data: record, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('id', originalId) // Use the record's own ID
      .single()

    if (fetchError) throw new Error(`Could not find the ${source} record: ${fetchError.message}`)

    // 2. Restore to active_subscriptions
    const { error: insertError } = await supabase.from('active_subscriptions').insert({
      user_id: record.user_id,
      subscription_name: record.subscription_name,
      website_link: record.website_link,
      start_date: record.start_date,
      expiration_date: record.expiration_date,
      cost: record.cost,
      currency: record.currency,
      status: 'active',
    })

    if (insertError) {
      if (insertError.code === '23505') {
        throw new Error(`An active subscription with the name "${record.subscription_name}" already exists. Please rename or delete it before restoring.`)
      }
      throw new Error(insertError.message)
    }

    // 3. Update record status if expired
    if (source === 'expired') {
      await supabase
        .from('expired_subscriptions')
        .update({ status: 'restored', restored_at: new Date().toISOString() })
        .eq('id', record.id)
    } else {
      // Or delete if soft-deleted
      await supabase.from('deleted_subscriptions').delete().eq('id', record.id)
    }

    revalidatePath('/dashboard')
  } catch (err) {
    console.error('Restore error:', err)
    throw err instanceof Error ? err : new Error('An unexpected error occurred during restoration.')
  }
}
