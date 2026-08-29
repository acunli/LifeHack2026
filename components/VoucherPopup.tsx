'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type VoucherPopupProps = {
  open: boolean
  onClose: () => void
  rank: number
  username: string
  rewards: number
}

const VOUCHER_VALUES = ['S$10 OFF', 'S$15 OFF', 'S$20 OFF', 'S$25 OFF', 'S$30 OFF']
const VOUCHER_CODES = ['ECOVOLT-SAVE-2026', 'ECOVOLT-ECO-2026', 'ECOVOLT-GREEN-2026', 'ECOVOLT-HERO-2026', 'ECOVOLT-STAR-2026']

export default function VoucherPopup({ open, onClose, username, rewards }: VoucherPopupProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [current, setCurrent] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'swiping-out' | 'swiping-in'>('idle')

  // Deferred into a frame: setting state in the effect body cascades a render
  // every time the popup opens.
  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      setCurrent(0)
      setPhase('idle')
    })
    return () => cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab') return
      const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ) ?? [])]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKey)
      previousFocus?.focus()
    }
  }, [open, onClose])

  const remaining = rewards - current

  function swipeNext() {
    if (current >= rewards - 1) return
    setPhase('swiping-out')
    setTimeout(() => {
      setCurrent((c) => c + 1)
      setPhase('swiping-in')
      setTimeout(() => setPhase('idle'), 400)
    }, 350)
  }

  if (!open || typeof document === 'undefined') return null

  const noVouchers = remaining <= 0
  const value = VOUCHER_VALUES[current % VOUCHER_VALUES.length]
  const code = VOUCHER_CODES[current % VOUCHER_CODES.length]

  return createPortal(
    <div className="voucher-scrim" onClick={onClose}>
      <div
        className="voucher-popup"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="voucher-title"
      >
        <button ref={closeButtonRef} className="voucher-close" onClick={onClose} aria-label="Close voucher">
          ✕
        </button>

        {noVouchers ? (
          <div className="voucher-empty-state">
            <div className="voucher-badge">🎟️</div>
            <div id="voucher-title" className="voucher-title">No Vouchers Remaining</div>
            <div className="voucher-sub">
              You&apos;ve viewed all your vouchers, <b>{username}</b>.
            </div>
            <div className="voucher-sub">
              Apply more savings to earn new ones!
            </div>
            <button className="voucher-close-btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="voucher-badge">
              🎟️ <span className="voucher-badge-count">{remaining}x</span>
            </div>
            <div id="voucher-title" className="voucher-title">Saving Unlocked!</div>
            <div className="voucher-sub">
              Congratulations <b>{username}</b>!
            </div>

            <div className={'voucher-page ' + (phase === 'swiping-out' ? 'swipe-out' : '') + (phase === 'swiping-in' ? 'swipe-in' : '')}>
              <div className="voucher-card">
                <div className="voucher-card-label">SAMPLE VOUCHER</div>
                <div className="voucher-card-value">{value}</div>
                <div className="voucher-card-desc">
                  Valid for next month&apos;s electricity bill
                </div>
                <div className="voucher-card-code">{code}</div>
              </div>
            </div>

            <div className="voucher-nav">
              <span className="voucher-page-indicator">
                {current + 1} / {rewards}
              </span>
              {current < rewards - 1 && (
                <button className="voucher-next-btn" onClick={swipeNext}>
                  Next Voucher →
                </button>
              )}
            </div>

            <div className="voucher-note">
              This is a sample voucher for demo purposes.
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
