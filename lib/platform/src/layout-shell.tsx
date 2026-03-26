import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";
import { clearToken } from "./auth";

export interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface LayoutShellProps {
  children: ReactNode;
  currentPath: string;
  navItems: NavItem[];
  brandName: string;
  brandSubtitle?: string;
  brandIcon?: React.ComponentType<{ className?: string }>;
  sidebar?: ReactNode;
  headerRight?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  linkComponent?: React.ComponentType<{ href: string; className?: string; onClick?: () => void; children: ReactNode }>;
  onLogout?: () => void;
  variant?: "sidebar" | "topbar";
  bottomNavItems?: NavItem[];
}

function DefaultLink({ href, className, onClick, children }: { href: string; className?: string; onClick?: () => void; children: ReactNode }) {
  return <a href={href} className={className} onClick={onClick}>{children}</a>;
}

export function LayoutShell({
  children,
  currentPath,
  navItems,
  brandName,
  brandSubtitle,
  brandIcon: BrandIcon,
  sidebar,
  headerRight,
  breadcrumbs,
  linkComponent: LinkComp = DefaultLink,
  onLogout,
  variant = "sidebar",
  bottomNavItems,
}: LayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearToken();
    onLogout?.();
  };

  if (variant === "topbar") {
    return (
      <TopbarLayout
        currentPath={currentPath}
        navItems={navItems}
        brandName={brandName}
        brandSubtitle={brandSubtitle}
        brandIcon={BrandIcon}
        headerRight={headerRight}
        breadcrumbs={breadcrumbs}
        linkComponent={LinkComp}
        onLogout={handleLogout}
        bottomNavItems={bottomNavItems}
      >
        {children}
      </TopbarLayout>
    );
  }

  const mobileBottomNav = bottomNavItems || navItems.slice(0, 5);

  return (
    <div className="min-h-screen flex w-full relative">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`w-72 fixed inset-y-0 left-0 z-40 glass-panel border-r border-border/50 flex flex-col transition-transform duration-300 safe-top ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {BrandIcon && (
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.4)]">
                <BrandIcon className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-display font-bold tracking-widest text-foreground">{brandName}</h1>
              {brandSubtitle && (
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-display">{brandSubtitle}</p>
              )}
            </div>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-white/10 text-muted-foreground touch-target" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <LinkComp
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/30 shadow-[inset_0_0_20px_hsl(var(--primary)/0.1)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-primary" : ""}`} />
                {item.label}
              </LinkComp>
            );
          })}
        </nav>

        {sidebar}

        <div className="p-4 mt-auto space-y-3">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-sm">
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-72 relative z-10 flex flex-col min-h-screen">
        <header className="h-14 sm:h-16 lg:h-20 glass-panel border-b border-border/50 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 safe-top">
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="md:hidden p-2 rounded-lg hover:bg-white/10 text-muted-foreground touch-target" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumbs items={breadcrumbs} linkComponent={LinkComp} />
            )}
          </div>
          {headerRight}
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1 pb-20 md:pb-8">
          <PageTransition locationKey={currentPath}>
            {children}
          </PageTransition>
        </div>
      </main>

      <BottomNav
        items={mobileBottomNav}
        currentPath={currentPath}
        linkComponent={LinkComp}
      />
    </div>
  );
}

function BottomNav({
  items,
  currentPath,
  linkComponent: LinkComp = DefaultLink,
}: {
  items: NavItem[];
  currentPath: string;
  linkComponent?: React.ComponentType<{ href: string; className?: string; onClick?: () => void; children: ReactNode }>;
}) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-border/50 safe-bottom bg-background/95 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 h-16">
        {items.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <LinkComp
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 rounded-lg transition-colors touch-target ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
              <span className="text-[10px] font-medium truncate max-w-[64px]">{item.label}</span>
            </LinkComp>
          );
        })}
      </div>
    </nav>
  );
}

function TopbarLayout({
  children,
  currentPath,
  navItems,
  brandName,
  brandSubtitle,
  brandIcon: BrandIcon,
  headerRight,
  breadcrumbs,
  linkComponent: LinkComp = DefaultLink,
  onLogout,
  bottomNavItems,
}: Omit<LayoutShellProps, "variant" | "sidebar">) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden text-foreground">
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-white/5 safe-top">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {BrandIcon && (
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg border border-primary/30 text-primary">
                <BrandIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}
            <div>
              <h1 className="font-display font-bold text-lg sm:text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {brandName}
              </h1>
              {brandSubtitle && (
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground -mt-1">{brandSubtitle}</p>
              )}
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              const Icon = item.icon;
              return (
                <LinkComp
                  key={item.path}
                  href={item.path}
                  className={`relative px-4 py-2 rounded-md text-sm font-display font-medium tracking-wide uppercase transition-colors flex items-center gap-2 ${
                    isActive ? "text-primary bg-primary/10 border border-primary/30" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 z-10 relative" />
                  <span className="z-10 relative">{item.label}</span>
                </LinkComp>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {headerRight}
            {onLogout && (
              <button onClick={onLogout} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Disconnect
              </button>
            )}
            <button className="md:hidden p-2 rounded-lg hover:bg-white/10 text-muted-foreground touch-target" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = currentPath === item.path;
                  const Icon = item.icon;
                  return (
                    <LinkComp
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-display font-medium tracking-wide uppercase transition-colors touch-target ${
                        isActive ? "text-primary bg-primary/10 border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </LinkComp>
                  );
                })}
                {onLogout && (
                  <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors touch-target">
                    <LogOut className="w-4 h-4" /> Disconnect
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 relative z-10 pb-20 md:pb-8">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbs} linkComponent={LinkComp} />
          </div>
        )}
        <PageTransition locationKey={currentPath}>
          {children}
        </PageTransition>
      </main>

      {bottomNavItems && (
        <BottomNav
          items={bottomNavItems}
          currentPath={currentPath}
          linkComponent={LinkComp}
        />
      )}
    </div>
  );
}

function Breadcrumbs({ items, linkComponent: LinkComp = DefaultLink }: { items: BreadcrumbItem[]; linkComponent?: React.ComponentType<{ href: string; className?: string; children: ReactNode }> }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
          {item.href ? (
            <LinkComp href={item.href} className="hover:text-foreground transition-colors">{item.label}</LinkComp>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

const reducedMotionVariants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 1, y: 0 },
};

const fullMotionVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export function PageTransition({ children, locationKey }: { children: ReactNode; locationKey: string }) {
  const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const variants = prefersReduced ? reducedMotionVariants : fullMotionVariants;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={locationKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: prefersReduced ? 0 : 0.2 }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
