// Centers the app in a phone-sized column. On desktop it renders inside a
// rounded device frame; on phones it fills the viewport edge-to-edge. The inner
// column clips overflow so no panel or modal can bleed past the rounded corners.

export default function PhoneFrame({ children }) {
  return (
    <div className="app-backdrop min-h-[100dvh] w-full flex items-center justify-center sm:p-6">
      <div className="relative w-full sm:max-w-[400px] sm:rounded-[40px] sm:border sm:border-stroke sm:shadow-2xl overflow-hidden">
        {/* Height caps to the viewport so the frame never overflows a short window. */}
        <div className="relative h-[100dvh] sm:h-[min(820px,calc(100dvh-3rem))] flex flex-col overflow-hidden app-backdrop">
          {children}
        </div>
      </div>
    </div>
  )
}
