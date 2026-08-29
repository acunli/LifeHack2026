'use client'

import { useEffect, useRef } from 'react'

type VoucherPopupProps = {
  open: boolean
  onClose: () => void
  rank: number
  username: string
}

export default function VoucherPopup({ open, onClose, rank, username }: VoucherPopupProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="voucher-scrim" onClick={onClose}>
      <div
        className="voucher-popup"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Voucher reward"
      >
        <button className="voucher-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="voucher-badge">
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
        </div>
        <div className="voucher-title">Top {rank} Reward!</div>
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
    </div>
  )
}
