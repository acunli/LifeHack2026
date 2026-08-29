'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type VoucherPopupProps = {
  open: boolean
  onClose: () => void
  rank: number
  username: string
}

export default function VoucherPopup({ open, onClose, rank, username }: VoucherPopupProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

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

  if (!open || typeof document === 'undefined') return null

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
        <div className="voucher-badge">
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
        </div>
        <div id="voucher-title" className="voucher-title">Top {rank} Reward!</div>
        <div className="voucher-sub">
          Congratulations <b>{username}</b>!
        </div>
        <div className="voucher-card">
          <div className="voucher-card-label">SAMPLE VOUCHER</div>
          <div className="voucher-card-value">S$10 OFF</div>
          <div className="voucher-card-desc">
            Valid for next month&apos;s electricity bill
          </div>
          <div className="voucher-card-code">ECOVOLT-TOP{rank}-2026</div>
        </div>
        <div className="voucher-note">
          This is a sample voucher for demo purposes.
        </div>
      </div>
    </div>,
    document.body,
  )
}
