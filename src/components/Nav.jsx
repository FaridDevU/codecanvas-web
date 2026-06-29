export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <img src="/media/logo-mark.png" alt="" className="h-7 w-7 rounded-md" />
          <span className="font-display text-[17px] font-semibold text-ink">CodeCanvas AI</span>
        </a>

        <div className="flex items-center gap-2">
          <a href="#join" className="btn btn-dark !py-2.5 text-sm">Start building</a>
          <a href="#faq" className="btn btn-light !px-4 !py-2.5 text-sm">Menu</a>
        </div>
      </nav>
    </header>
  )
}
