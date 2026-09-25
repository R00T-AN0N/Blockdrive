"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion";

import { useIsMobile } from "@/components/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

const SidebarContext = React.createContext(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.")
  return context
}

export const SidebarProvider = React.forwardRef(function SidebarProvider(
  { defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props },
  ref
) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback((value) => {
    const openState = typeof value === "function" ? value(open) : value
    if (setOpenProp) setOpenProp(openState)
    else _setOpen(openState)
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
  }, [setOpenProp, open])

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((v) => !v) : setOpen((v) => !v)
  }, [isMobile, setOpen, setOpenMobile])

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"
  const contextValue = React.useMemo(() => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }), [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar])

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={{ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON, ...style }}
          className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className)}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
})

export const Sidebar = React.forwardRef(function Sidebar(
  { side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props },
  ref
) {
  const { isMobile, state, openMobile, setOpenMobile, setOpen } = useSidebar();
  const sidebarRef = React.useRef(null);

  // ✅ Close desktop sidebar when clicking outside
  React.useEffect(() => {
    if (isMobile || state === "collapsed") return; // only apply on desktop & when expanded

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, state, setOpen]);

  if (collapsible === "none") {
    return (
      <div
        className={cn("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }



  const mobileSheet = (
    <div className="md:hidden">
      {/* Dark overlay behind sidebar */}
      <AnimatePresence>
        {openMobile && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-[100]"
            onClick={() => setOpenMobile(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {openMobile && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 80, damping: 18 }}
            className="fixed top-0 left-0 z-[200] w-64 h-screen bg-white shadow-2xl border-r border-gray-200 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
              <button
                onClick={() => setOpenMobile(false)}
                className="text-gray-600 hover:text-gray-900 text-lg font-bold"
              >

              </button>
            </div>

            <div className="flex flex-col mt-4 p-4 gap-4">{children}</div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );


  const SIDEBAR_ANIM = {
    open: { x: 0, opacity: 1, transition: { type: "tween", duration: 0.28, ease: "easeInOut" } },
    closed: (side = "left") => ({
      x: side === "left" ? "-100%" : "100%",
      opacity: 0,
      transition: { type: "tween", duration: 0.28, ease: "easeInOut" },
    }),
  }


  const desktopSidebar = (
    <div
      ref={sidebarRef}
      className="group peer hidden md:block text-sidebar-foreground"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
    >
      {/* Single animated sidebar container */}
      <div
        className={cn(
          "duration-300 ease-in-out fixed inset-y-0 z-20 h-svh bg-white shadow-lg border-r transition-all top-14",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:-left-[var(--sidebar-width)]"
            : "right-0 group-data-[collapsible=offcanvas]:-right-[var(--sidebar-width)]",
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)] rounded-lg"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
          state === "collapsed"
            ? "w-[--sidebar-width-icon]"
            : "w-[--sidebar-width]",
          className
        )}
      >
        <div
          data-sidebar="sidebar"
          className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border"
        >
          {children}
        </div>
      </div>
    </div>
  )


  return (
    <>
      {mobileSheet}
      {desktopSidebar}
    </>
  );
});


export const SidebarTrigger = React.forwardRef(function SidebarTrigger(
  { className, onClick, ...props },
  ref
) {
  const { toggleSidebar, isMobile, setOpenMobile } = useSidebar()
  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        const mobileFallback = typeof window !== 'undefined' ? window.innerWidth < 768 : false
        const isOnMobile = typeof isMobile === 'boolean' ? isMobile : mobileFallback
        if (isOnMobile) setOpenMobile((v) => !v)
        else toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})

export const SidebarRail = React.forwardRef(function SidebarRail(
  { className, ...props },
  ref
) {
  const { toggleSidebar } = useSidebar()
  return (
    <button ref={ref} data-sidebar="rail" aria-label="Toggle Sidebar" tabIndex={-1} onClick={toggleSidebar} title="Toggle Sidebar" className={cn(
      "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
      "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
      "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
      "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
      "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
      "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
      className
    )} {...props} />
  )
})

export const SidebarInset = React.forwardRef(function SidebarInset(
  { className, children, ...props },
  ref
) {
  return (
    <main
      ref={ref}
      className={cn(
        // Base layout
        "relative flex min-h-screen flex-1 items-center justify-center w-full bg-background p-0",

        // Desktop inset variant
        "peer-data-[variant=inset]:min-h-[calc(100vh-theme(spacing.4))] md:peer-data-[variant=inset]:m-0",
        "md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",

        // Prevent sidebar pushing content on small screens
        "transition-all duration-300 ease-in-out",

        className
      )}
      {...props}
    >
      <div className="w-full">{children}</div>
    </main>
  );
});


export const SidebarInput = React.forwardRef(function SidebarInput(
  { className, ...props },
  ref
) {
  return <Input ref={ref} data-sidebar="input" className={cn("h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring", className)} {...props} />
})

export const SidebarHeader = React.forwardRef(function SidebarHeader(
  { className, ...props },
  ref
) {
  return <div ref={ref} data-sidebar="header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />
})

export const SidebarFooter = React.forwardRef(function SidebarFooter(
  { className, ...props },
  ref
) {
  return <div ref={ref} data-sidebar="footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} />
})

export const SidebarSeparator = React.forwardRef(function SidebarSeparator(
  { className, ...props },
  ref
) {
  return <Separator ref={ref} data-sidebar="separator" className={cn("mx-2 w-auto bg-sidebar-border", className)} {...props} />
})

export const SidebarContent = React.forwardRef(function SidebarContent(
  { className, ...props },
  ref
) {
  return <div ref={ref} data-sidebar="content" className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className)} {...props} />
})

export const SidebarGroup = React.forwardRef(function SidebarGroup(
  { className, ...props },
  ref
) {
  return <div ref={ref} data-sidebar="group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />
})

export const SidebarGroupLabel = React.forwardRef(function SidebarGroupLabel(
  { className, asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp ref={ref} data-sidebar="group-label" className={cn(
      "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
      "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
      className
    )} {...props} />
  )
})

export const SidebarGroupAction = React.forwardRef(function SidebarGroupAction(
  { className, asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp ref={ref} data-sidebar="group-action" className={cn(
      "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
      "after:absolute after:-inset-2 after:md:hidden",
      "group-data-[collapsible=icon]:hidden",
      className
    )} {...props} />
  )
})

export const SidebarGroupContent = React.forwardRef(function SidebarGroupContent(
  { className, ...props },
  ref
) {
  return <div ref={ref} data-sidebar="group-content" className={cn("w-full text-sm", className)} {...props} />
})

export const SidebarMenu = React.forwardRef(function SidebarMenu(
  { className, ...props },
  ref
) {
  return <ul ref={ref} data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
})

export const SidebarMenuItem = React.forwardRef(function SidebarMenuItem(
  { className, ...props },
  ref
) {
  return <li ref={ref} data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />
})

const sidebarMenuButtonVariants = cva(


  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  { variants: { variant: { default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]", }, size: { default: "h-8 text-sm", sm: "h-7 text-xs", lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0", }, }, defaultVariants: { variant: "default", size: "default" } }
)

export const SidebarMenuButton = React.forwardRef(function SidebarMenuButton(
  { asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button"
  const { isMobile, state } = useSidebar()
  const button = (
    <Comp ref={ref} data-sidebar="menu-button" data-size={size} data-active={isActive} className={cn(sidebarMenuButtonVariants({ variant, size }), className)} {...props} />
  )
  if (!tooltip) return button
  if (typeof tooltip === "string") tooltip = { children: tooltip }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile} {...tooltip} />
    </Tooltip>
  )
})

export const SidebarMenuAction = React.forwardRef(function SidebarMenuAction(
  { className, asChild = false, showOnHover = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp ref={ref} data-sidebar="menu-action" className={cn(
      "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
      "after:absolute after:-inset-2 after:md:hidden",
      "group-data-[collapsible=icon]:hidden",
      showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
      className
    )} {...props} />
  )
})

export const SidebarMenuBadge = React.forwardRef(function SidebarMenuBadge(
  { className, ...props },
  ref
) {
  return <div ref={ref} data-sidebar="menu-badge" className={cn("absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none", "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground", className)} {...props} />
})

export const SidebarMenuSkeleton = React.forwardRef(function SidebarMenuSkeleton(
  { className, showIcon = false, ...props },
  ref
) {
  const width = React.useMemo(() => `${Math.floor(Math.random() * 40) + 50}%`, [])
  return (
    <div ref={ref} data-sidebar="menu-skeleton" className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)} {...props}>
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton className="h-4 flex-1 max-w-[--skeleton-width]" data-sidebar="menu-skeleton-text" style={{ "--skeleton-width": width }} />
    </div>
  )
})

export const SidebarMenuSub = React.forwardRef(function SidebarMenuSub(
  { className, ...props },
  ref
) {
  return <ul ref={ref} data-sidebar="menu-sub" className={cn("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5", "group-data-[collapsible=icon]:hidden", className)} {...props} />
})

export const SidebarMenuSubItem = React.forwardRef(function SidebarMenuSubItem(
  props,
  ref
) { return <li ref={ref} {...props} /> })

export const SidebarMenuSubButton = React.forwardRef(function SidebarMenuSubButton(
  { asChild = false, size = "md", isActive, className, ...props },
  ref
) {
  const Comp = asChild ? Slot : "a"
  return <Comp ref={ref} data-sidebar="menu-sub-button" data-size={size} data-active={isActive} className={cn(
    "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
    "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
    size === "sm" && "text-xs",
    size === "md" && "text-sm",
    "group-data-[collapsible=icon]:hidden",
    className
  )} {...props} />
})
