import { Link } from 'react-router-dom'
import { Logo } from './logo'
import { useApp } from '@/store/app'

/** On phones the rail is gone, so identity lives inline with the floating chrome. */
export function MobileIdentity() {
  const workspace = useApp((s) => s.workspace)
  return (
    <Link
      to="/"
      className="chrome pointer-events-auto flex h-9 items-center gap-2 rounded-full pl-1.5 pr-3.5 lg:hidden"
    >
      <Logo size={24} />
      <span className="max-w-[9rem] truncate text-sm font-medium text-ink">{workspace.name}</span>
    </Link>
  )
}
