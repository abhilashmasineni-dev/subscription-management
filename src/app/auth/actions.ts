'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const adminClient = await createAdminClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Create the user with auto-confirmation using the Admin API
  // This bypasses the email sending process and the "rate limit exceeded" error.
  const { error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (createError) {
    redirect('/login?error=' + encodeURIComponent(createError.message))
  }

  // 2. Now sign in using the normal client to establish a user session (cookies)
  const supabase = await createClient()
  const { error: loginError } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  })

  if (loginError) {
    redirect('/login?error=' + encodeURIComponent(loginError.message))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
