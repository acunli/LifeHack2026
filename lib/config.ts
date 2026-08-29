/**
 * Application configuration.
 *
 * These values are read from environment variables where available and fall
 * back to clearly-marked placeholders. No real support contact details are
 * invented here — replace the placeholders with configured values in
 * production (e.g. via NEXT_PUBLIC_* env vars).
 */

export const APP_TIMEZONE =
  process.env.NEXT_PUBLIC_APP_TIMEZONE || 'Asia/Singapore'

type SupportConfig = {
  email?: string
  phone?: string
  contactUrl?: string
  faqUrl?: string
  privacyUrl?: string
  termsUrl?: string
}

/**
 * Support/contact configuration. Only values present here are rendered in the
 * footer. Anything left undefined is simply not shown, so we never surface a
 * fake email or phone number.
 */
export const SUPPORT: SupportConfig = {
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || undefined,
  phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || undefined,
  contactUrl: process.env.NEXT_PUBLIC_CONTACT_URL || undefined,
  faqUrl: process.env.NEXT_PUBLIC_FAQ_URL || undefined,
  privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_URL || undefined,
  termsUrl: process.env.NEXT_PUBLIC_TERMS_URL || undefined,
}

/**
 * Required attribution for the interior/character pixel art used across the
 * app (see README). Rendered in the footer.
 */
export const ATTRIBUTION = {
  label: 'LimeZu — Modern Interiors',
  href: 'https://limezu.itch.io/moderninteriors',
}
