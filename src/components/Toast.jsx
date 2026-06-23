import { useEffect } from 'react'

// Transient bottom toast for turn results and action feedback.
export default function Toast({ message, onClear }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClear, 2200)
    return () => clearTimeout(t)
  }, [message, onClear])

  if (!message) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center px-4 z-50">
      <div className="animate-fade-in glass border border-accent-2/40 rounded-full px-4 py-2 text-[13px] text-text-hi shadow-glow">
        {message}
      </div>
    </div>
  )
}
