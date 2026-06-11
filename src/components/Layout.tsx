import { NavLink, Outlet } from 'react-router-dom'
import { Leaf, ClipboardList, Factory, History } from 'lucide-react'

export default function Layout() {
  const navItems = [
    { to: '/', label: '批次列表', icon: ClipboardList },
    { to: '/production', label: '投产登记', icon: Factory },
  ]

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-bamboo-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bamboo-500 to-bamboo-700 flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-semibold text-bamboo-900 leading-none">
                竹编工坊
              </h1>
              <p className="text-[11px] text-bamboo-500 mt-0.5">篾条晾晒批次追溯系统</p>
            </div>
          </NavLink>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-bamboo-100 text-bamboo-800'
                      : 'text-bamboo-600 hover:bg-bamboo-50 hover:text-bamboo-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="py-6 text-center text-xs text-bamboo-400">
        <div className="flex items-center justify-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          <span>竹编工坊 · 传统工艺与现代追溯</span>
        </div>
      </footer>
    </div>
  )
}
