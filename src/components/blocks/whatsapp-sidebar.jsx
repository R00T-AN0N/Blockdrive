import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCloudArrowUp,
  faClockRotateLeft,
  faPhone,
  faInfoCircle,
  faBars,
  faGear,
  faUser,
  faFileArrowDown,

} from "@fortawesome/free-solid-svg-icons"

import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "./sidebar"
import { useSidebar } from "@/components/blocks/sidebar"

export function AppSidebar() {
  const items = [
    { title: "Uploader", icon: faCloudArrowUp, path: "/file_upload" },
    { title: "File Access", icon: faFileArrowDown, path: "/file-access" },
    { title: "History", icon: faClockRotateLeft, path: "/history" },
    { title: "Contact Us", icon: faPhone, path: "/contact" },
    { title: "About Us", icon: faInfoCircle, path: "/about" },
    { title: "Profile", icon: faUser, path: "/profile" }
  ]

  const { open, toggleSidebar, setOpen } = useSidebar()
  const location = useLocation()

  const handleItemClick = () => {
    // ✅ Only toggle open if it's closed; don't re-toggle if already open
    if (!open) setOpen(true)
  }

  return (
    <Sidebar
      variant="float"
      collapsible="icon"
      className="bg-white text-gray-800 shadow-md border-r border-gray-200 transition-all duration-300 ease-in-out"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Desktop toggle button */}
            <SidebarMenu className="hidden md:flex">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={(e) => {
                    e.preventDefault()
                    toggleSidebar()
                  }}
                  className="hover:bg-gray-100 text-gray-800"
                >
                  <FontAwesomeIcon icon={faBars} />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            {/* Sidebar links */}
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      onClick={() => handleItemClick(item.path)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${isActive
                        ? "bg-gray-300 text-gray-800 font-semibold"
                        : "hover:bg-gray-100 text-gray-900"
                        }`}
                    >
                      <Link to={item.path}>
                        <FontAwesomeIcon icon={item.icon} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-gray-100 text-gray-800">
              <FontAwesomeIcon icon={faGear} />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
