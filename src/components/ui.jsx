// Shared UI primitives for the whole app. Every screen is built from these so
// spacing, overflow handling, and button styling stay consistent (no bleeds).

import { IconChevronLeft } from './Icons.jsx'

// ---- Screen container ------------------------------------------------------
// Standard scrollable body: consistent padding, clips horizontal overflow so
// nothing bleeds past the device edges, and leaves room above the bottom nav.
export function Screen({ children, className = '' }) {
  return (
    <div
      className={[
        'flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar',
        'px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-6 animate-fade-in',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

// ---- Screen header ---------------------------------------------------------
// Balanced 3-column header: fixed-width side slots keep the title centred and
// truncating, so long names never push the layout.
export function ScreenHeader({ left, right, title, subtitle, large = false }) {
  return (
    <header className="flex items-center gap-2 mb-4 pt-1">
      <div className="w-9 shrink-0 flex justify-start">{left}</div>
      <div className="flex-1 min-w-0 text-center px-1">
        <h1
          className={[
            'font-display font-bold text-text-hi leading-none truncate tracking-tight',
            large ? 'text-[22px]' : 'text-[18px] font-semibold',
          ].join(' ')}
        >
          {title}
        </h1>
        {subtitle && <p className="text-[11.5px] text-text-dim mt-1 truncate">{subtitle}</p>}
      </div>
      <div className="w-9 shrink-0 flex justify-end">{right}</div>
    </header>
  )
}

// ---- Icon button (header actions) ------------------------------------------
export function IconButton({ icon, label, onClick, className = '' }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        'h-9 w-9 flex items-center justify-center rounded-xl text-text-mid',
        'hover:text-text-hi hover:bg-bg-panel-2/50 transition-colors',
        className,
      ].join(' ')}
    >
      {icon}
    </button>
  )
}

export const BackButton = ({ onClick }) => (
  <IconButton icon={<IconChevronLeft size={22} />} label="Back" onClick={onClick} />
)

// ---- Button ----------------------------------------------------------------
// One button to rule them all. Variants + sizes; optional sub-label and
// leading/trailing icons. Labels truncate so text can never overflow.
const BTN_SIZES = {
  sm: 'px-3 py-2 text-[12.5px]',
  md: 'px-4 py-2.5 text-[13px]',
  lg: 'px-4 py-3.5 text-[14px]',
}
const BTN_VARIANTS = {
  solid: 'bg-accent text-white shadow-glow hover:bg-accent/90',
  gradient: 'bg-gradient-to-r from-accent to-accent-2 text-white hover:opacity-95',
  ghost: 'glass border border-stroke text-text-hi hover:border-accent-2/50',
  subtle: 'bg-bg-panel-2 border border-stroke text-text-hi hover:border-accent',
  outline: 'border border-stroke text-text-mid hover:text-text-hi hover:border-accent-2/60',
  danger: 'border border-[#E05B6C]/50 text-[#ff9aa6] hover:bg-[#E05B6C]/10',
}

export function Button({
  children,
  sub,
  icon,
  trailing,
  variant = 'solid',
  size = 'md',
  full = false,
  disabled = false,
  className = '',
  ...props
}) {
  const tone = BTN_VARIANTS[variant] || BTN_VARIANTS.solid
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        'inline-flex items-center gap-2.5 font-semibold rounded-xl transition-colors',
        'active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none select-none',
        sub ? 'text-left justify-between' : 'justify-center',
        full ? 'w-full' : '',
        BTN_SIZES[size],
        tone,
        className,
      ].join(' ')}
      {...props}
    >
      {icon && <span className="shrink-0 opacity-90">{icon}</span>}
      {sub ? (
        <span className="flex-1 min-w-0">
          <span className="block leading-tight truncate">{children}</span>
          <span className="block text-[11px] font-normal opacity-70 leading-tight truncate">{sub}</span>
        </span>
      ) : (
        <span className="truncate">{children}</span>
      )}
      {trailing && <span className="shrink-0 opacity-70">{trailing}</span>}
    </button>
  )
}

// ---- Modal -----------------------------------------------------------------
// Bottom-sheet on phones, centred card on desktop. Bounded height + internal
// scroll so tall content never bleeds off-screen.
export function Modal({ children, onClose, accent = 'accent' }) {
  const border =
    accent === 'gold' ? 'border-gold/40' : accent === 'danger' ? 'border-[#E05B6C]/40' : 'border-accent-2/40'
  return (
    <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-bg-deep/90" onClick={onClose} />
      <div
        className={[
          'relative w-full max-w-[360px] max-h-[85%] overflow-y-auto no-scrollbar',
          'glass border rounded-3xl p-5 shadow-glow animate-slide-up',
          border,
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalLabel({ icon, children, accent = 'accent' }) {
  const tint = accent === 'gold' ? 'text-gold bg-gold/15 border-gold/40' : 'text-accent-2 bg-accent/20 border-accent/40'
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`h-8 w-8 rounded-xl border flex items-center justify-center ${tint}`}>{icon}</div>
      <span className="text-[12px] uppercase tracking-[0.14em] text-text-dim font-semibold">{children}</span>
    </div>
  )
}

// ---- StatusBar -------------------------------------------------------------
export function StatusBar({ label, value, gradient = false, tone }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  const fill = gradient
    ? 'linear-gradient(90deg, #5B6CFF 0%, #8A7CFF 100%)'
    : tone === 'gold'
      ? '#E8B84B'
      : tone === 'low' && pct < 30
        ? '#E05B6C'
        : '#5B6CFF'
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-[13px] text-text-mid truncate">{label}</span>
        <span className="text-[13px] text-text-hi tnum font-medium shrink-0">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-bg-panel-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%`, background: fill }}
        />
      </div>
    </div>
  )
}

// ---- Card ------------------------------------------------------------------
export function Card({ children, className = '', onClick, as = 'div', ...rest }) {
  const Comp = onClick ? 'button' : as
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={[
        'glass border border-stroke rounded-card shadow-panel text-left overflow-hidden',
        onClick
          ? 'transition-colors duration-200 hover:border-accent-2/50 hover:bg-bg-panel-2/40 active:bg-bg-panel-2/60 cursor-pointer w-full'
          : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </Comp>
  )
}

// ---- Section label ---------------------------------------------------------
export function SectionLabel({ children, action, onAction }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-2.5 mt-1">
      <h3 className="text-[12px] uppercase tracking-[0.14em] text-text-dim font-semibold truncate">
        {children}
      </h3>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="text-[12px] text-accent-2 hover:text-text-hi transition-colors font-medium shrink-0"
        >
          {action}
        </button>
      )}
    </div>
  )
}

// ---- Tabs (segmented pill control) ----------------------------------------
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-full bg-bg-panel-2/70 border border-stroke">
      {tabs.map((t) => {
        const on = t === active
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={[
              'flex-1 min-w-0 text-[12.5px] font-medium py-1.5 rounded-full transition-colors truncate',
              on ? 'bg-accent text-white shadow' : 'text-text-mid hover:text-text-hi',
            ].join(' ')}
          >
            {t}
          </button>
        )
      })}
    </div>
  )
}

// ---- Trait chip ------------------------------------------------------------
export function TraitChip({ children, active, onClick, muted }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={[
        'px-3 py-1.5 rounded-full text-[12.5px] font-medium border transition-colors',
        active
          ? 'bg-accent/20 border-accent text-text-hi'
          : muted
            ? 'border-stroke text-text-dim'
            : 'border-stroke text-text-mid hover:border-accent-2/60 hover:text-text-hi',
        onClick ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

// ---- Avatar (initials) -----------------------------------------------------
export function Avatar({ name, size = 44 }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div
      className="rounded-2xl flex items-center justify-center font-display font-semibold text-text-hi shrink-0"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #5B6CFF 0%, #8A7CFF 100%)',
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </div>
  )
}
