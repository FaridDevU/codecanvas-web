// Curved SVG divider so sections flow into each other instead of stacking as
// hard rectangles. `flip` mirrors it for the bottom of a section.
export default function Curve({ flip = false, color = '#0d1320', className = '' }) {
  return (
    <div className={`pointer-events-none relative w-full ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-[60px] w-full sm:h-[110px]"
        style={{ transform: flip ? 'scaleY(-1)' : 'none' }}
      >
        <path d="M0,64 C360,128 1080,0 1440,64 L1440,120 L0,120 Z" fill={color} />
      </svg>
    </div>
  )
}
