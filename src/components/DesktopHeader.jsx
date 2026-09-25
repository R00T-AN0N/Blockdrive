import React from "react"
import { WalletConnect } from "./WalletConnect"

export const Header = () => {

  return (
    <header
      className="hidden md:flex fixed top-0 left-0 right-0 h-14 bg-white shadow-sm border-b border-gray-200 items-center justify-between px-6 z-30"
    >
      {/* Left: Web Name */}
      <h1 className="text-xl font-semibold text-gray-900">
        Block<span className="text-blue-600">Drive</span>
      </h1>

      {/* Right: Wallet Connect */}
      <WalletConnect />
    </header>
  )
}
