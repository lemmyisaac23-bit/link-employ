import type { UserSession } from './auth'
import { getUserSession, setUserSession } from './auth'
import {
  addUser,
  checkUserCredentials,
  getUsers,
  type RegisteredUser,
} from './store'
import { isSupabaseConfigured, requireSupabase, supabase } from './supabaseClient'

export type CloudProfile = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  country: string | null
  created_at: string
}

export type RegisterInput = {
  firstName: string
  lastName: string
  email: string
  phone?: string
  country?: string
  password: string
}

function profileToSession(profile: CloudProfile): UserSession {
  return {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    country: profile.country || undefined,
  }
}

function profileToRegistered(profile: CloudProfile): RegisteredUser {
  return {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    phone: profile.phone || undefined,
    country: profile.country || undefined,
    createdAt: profile.created_at,
  }
}

async function fetchProfile(userId: string): Promise<CloudProfile | null> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('profiles')
    .select('id, first_name, last_name, email, phone, country, created_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

async function upsertProfile(
  userId: string,
  input: Omit<RegisterInput, 'password'>,
): Promise<CloudProfile> {
  const client = requireSupabase()
  const row = {
    id: userId,
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    country: input.country?.trim() || null,
  }

  const { data, error } = await client
    .from('profiles')
    .upsert(row, { onConflict: 'id' })
    .select('id, first_name, last_name, email, phone, country, created_at')
    .single()

  if (error) throw new Error(error.message)
  return data
}

function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials')) {
    return 'Invalid email or password.'
  }
  if (lower.includes('user already registered')) {
    return 'An account with this email already exists. Sign in instead.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirm your email before signing in, or disable email confirmation in Supabase Auth settings.'
  }
  if (lower.includes('password')) {
    return message
  }
  return message
}

export async function registerWithCloud(
  input: RegisterInput,
): Promise<UserSession> {
  if (!isSupabaseConfigured) {
    const user = addUser({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      country: input.country,
      password: input.password,
    })
    const session: UserSession = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      country: user.country,
    }
    setUserSession(session)
    return session
  }

  const client = requireSupabase()
  const email = input.email.trim().toLowerCase()
  const password = input.password.trim()

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
        phone: input.phone?.trim() || '',
        country: input.country?.trim() || '',
      },
      emailRedirectTo: window.location.origin,
    },
  })

  if (error) throw new Error(friendlyAuthError(error.message))
  if (!data.user) throw new Error('Could not create your account.')

  // If email confirmation is enabled and no session yet, try signing in anyway
  // (works when confirmation is disabled, which we recommend).
  if (!data.session) {
    const signIn = await client.auth.signInWithPassword({ email, password })
    if (signIn.error) {
      throw new Error(
        'Account created. Confirm your email, then sign in. (Or turn off “Confirm email” in Supabase Auth settings for instant access.)',
      )
    }
  }

  const profile =
    (await fetchProfile(data.user.id)) ||
    (await upsertProfile(data.user.id, {
      firstName: input.firstName,
      lastName: input.lastName,
      email,
      phone: input.phone,
      country: input.country,
    }))

  const session = profileToSession(profile)
  setUserSession(session)
  return session
}

export async function signInWithCloud(
  email: string,
  password: string,
): Promise<UserSession> {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedPassword = password.trim()

  if (!isSupabaseConfigured) {
    const result = checkUserCredentials(normalizedEmail, normalizedPassword)
    if (!result.ok) {
      if (result.reason === 'not_found') {
        throw new Error(
          'No account found for this email. Create an account first.',
        )
      }
      throw new Error('Invalid email or password.')
    }
    const session: UserSession = {
      id: result.user.id,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      email: result.user.email,
      country: result.user.country,
    }
    setUserSession(session)
    return session
  }

  const client = requireSupabase()
  const { data, error } = await client.auth.signInWithPassword({
    email: normalizedEmail,
    password: normalizedPassword,
  })

  if (error) throw new Error(friendlyAuthError(error.message))
  if (!data.user) throw new Error('Invalid email or password.')

  const meta = data.user.user_metadata || {}
  const profile =
    (await fetchProfile(data.user.id)) ||
    (await upsertProfile(data.user.id, {
      firstName: String(meta.first_name || normalizedEmail.split('@')[0] || 'User'),
      lastName: String(meta.last_name || ''),
      email: normalizedEmail,
      phone: meta.phone ? String(meta.phone) : undefined,
      country: meta.country ? String(meta.country) : undefined,
    }))

  const session = profileToSession(profile)
  setUserSession(session)
  return session
}

export async function restoreCloudSession(): Promise<UserSession | null> {
  if (!isSupabaseConfigured || !supabase) {
    return getUserSession()
  }

  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session?.user) {
    setUserSession(null)
    return null
  }

  const user = data.session.user
  const meta = user.user_metadata || {}
  const profile =
    (await fetchProfile(user.id)) ||
    (await upsertProfile(user.id, {
      firstName: String(meta.first_name || user.email?.split('@')[0] || 'User'),
      lastName: String(meta.last_name || ''),
      email: (user.email || '').toLowerCase(),
      phone: meta.phone ? String(meta.phone) : undefined,
      country: meta.country ? String(meta.country) : undefined,
    }))

  const session = profileToSession(profile)
  setUserSession(session)
  return session
}

export async function signOutCloud(): Promise<void> {
  setUserSession(null)
  if (supabase) {
    await supabase.auth.signOut()
  }
}

export async function listRegisteredUsers(): Promise<RegisteredUser[]> {
  if (!isSupabaseConfigured || !supabase) {
    return getUsers()
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, phone, country, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    // Fall back to local cache if admin policy is not ready yet
    console.warn('Could not load cloud users:', error.message)
    return getUsers()
  }

  return (data || []).map(profileToRegistered)
}
