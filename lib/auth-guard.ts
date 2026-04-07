import { auth } from '@/auth'

/**
 * Require an authenticated admin session.
 * Call at the top of every mutating server action.
 * Throws if no valid session exists — the error is caught
 * by the action's own try/catch and returned as { error }.
 */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session
}
