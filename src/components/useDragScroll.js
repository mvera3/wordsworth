import { useRef } from 'react'

// Click-and-drag horizontal scrolling for a `overflow-x-auto` container.
//
// On a touchscreen the browser already drag-scrolls natively, so we ignore
// touch pointers and let that happen. For mouse (and pen) we translate a drag
// into scrollLeft, and swallow the trailing click so dragging across a tab
// doesn't also "press" it. Spread the returned handlers onto the scroll element.
export function useDragScroll() {
  const ref = useRef(null)
  const st = useRef({ down: false, startX: 0, scroll: 0, moved: false })

  const onPointerDown = (e) => {
    if (e.pointerType === 'touch') return // native touch scroll handles this
    const el = ref.current
    if (!el) return
    st.current = { down: true, startX: e.clientX, scroll: el.scrollLeft, moved: false }
    el.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e) => {
    const s = st.current
    if (!s.down) return
    const el = ref.current
    if (!el) return
    const dx = e.clientX - s.startX
    if (Math.abs(dx) > 3) s.moved = true
    el.scrollLeft = s.scroll - dx
  }

  const end = (e) => {
    const s = st.current
    if (!s.down) return
    s.down = false
    ref.current?.releasePointerCapture?.(e.pointerId)
  }

  // If the pointer moved, cancel the click so the drag doesn't select a tab.
  const onClickCapture = (e) => {
    if (st.current.moved) {
      e.stopPropagation()
      e.preventDefault()
      st.current.moved = false
    }
  }

  return {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp: end,
    onPointerCancel: end,
    onPointerLeave: end,
    onClickCapture,
  }
}
