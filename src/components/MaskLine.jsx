// Salvaged from the deleted Approach/VideoReel components: one headline line that
// rises out of an overflow clip and settles. Reusable util — drive `shown` from
// an IntersectionObserver and stagger lines with `delay`.
export default function MaskLine({ children, shown, delay = '0s' }) {
  return (
    <span className="block overflow-hidden" style={{ paddingBottom: '0.12em', marginBottom: '-0.12em' }}>
      <span
        className="block will-change-transform"
        style={{
          transform: shown ? 'translateY(0)' : 'translateY(115%)',
          transition: 'transform 0.85s cubic-bezier(.22,.7,.2,1)',
          transitionDelay: shown ? delay : '0s',
        }}
      >
        {children}
      </span>
    </span>
  )
}
