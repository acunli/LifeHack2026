/**
 * App footer. Renders required art attribution and any configured support
 * links. Support entries only appear when a real value is configured (see
 * lib/config.ts) so no fake contact details are ever shown.
 */

import { ATTRIBUTION, SUPPORT } from '@/lib/config'

export function Footer() {
  const links: { label: string; href: string }[] = []
  if (SUPPORT.email) links.push({ label: 'Contact', href: `mailto:${SUPPORT.email}` })
  else if (SUPPORT.contactUrl) links.push({ label: 'Contact', href: SUPPORT.contactUrl })
  if (SUPPORT.faqUrl) links.push({ label: 'FAQ', href: SUPPORT.faqUrl })
  if (SUPPORT.privacyUrl) links.push({ label: 'Privacy', href: SUPPORT.privacyUrl })
  if (SUPPORT.termsUrl) links.push({ label: 'Terms', href: SUPPORT.termsUrl })

  return (
    <footer className="mx-auto mt-10 w-full max-w-2xl border-t-3 border-border-w px-4 py-6">
      {links.length > 0 && (
        <nav aria-label="Support" className="mb-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="pixel text-[9px] text-muted-w underline underline-offset-4 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
      {SUPPORT.phone && (
        <p className="pixel mb-3 text-center text-[9px] text-muted-w">
          Support: <a className="text-foreground underline underline-offset-4" href={`tel:${SUPPORT.phone}`}>{SUPPORT.phone}</a>
        </p>
      )}
      <p className="pixel text-center text-[8px] leading-relaxed text-muted-w">
        Pixel interior art:{' '}
        <a
          href={ATTRIBUTION.href}
          target="_blank"
          rel="noreferrer noopener"
          className="text-foreground underline underline-offset-4"
        >
          {ATTRIBUTION.label}
        </a>
      </p>
      <p className="pixel mt-2 text-center text-[8px] text-muted-w">
        WattLah is a friendly energy-saving game.
      </p>
    </footer>
  )
}

export default Footer
