export const ADMIN_EMAIL = 'worklinkus@gmail.com'
export const ADMIN_PASSWORD = 'Rito@2070'

const ADMIN_SESSION_KEY = 'worklinkus_admin_session'
const USER_SESSION_KEY = 'worklinkus_user_session'

export type UserSession = {
  id: string
  firstName: string
  lastName: string
  email: string
  country?: string
}

export function isAdminAuthenticated(): boolean {
  return localStorage.getItem(ADMIN_SESSION_KEY) === 'true'
}

export function setAdminSession(active: boolean) {
  if (active) {
    localStorage.setItem(ADMIN_SESSION_KEY, 'true')
  } else {
    localStorage.removeItem(ADMIN_SESSION_KEY)
  }
}

export function validateAdminLogin(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    password === ADMIN_PASSWORD
  )
}

export function getUserSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserSession
  } catch {
    return null
  }
}

export function setUserSession(user: UserSession | null) {
  if (!user) {
    localStorage.removeItem(USER_SESSION_KEY)
    return
  }
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user))
}

export function isUserAuthenticated(): boolean {
  return getUserSession() !== null
}
