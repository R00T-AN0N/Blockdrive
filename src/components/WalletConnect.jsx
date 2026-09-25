import React from "react";
import { useWallet } from "../contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export const WalletConnect = ({ className }) => {
    const { account, isConnected, connectWallet, error } = useWallet();

    const formatAddress = (addr) => {
        if (!addr) return "";
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    const handleClick = async () => {
        if (!isConnected) {
            await connectWallet();
        }
    };

    return (
        <div className="flex flex-col items-end">
            <Button
                variant={isConnected ? "outline" : "default"}
                onClick={handleClick}
                className={`flex items-center gap-2 ${className}`}
            >
                <Wallet className="w-4 h-4" />
                {isConnected ? formatAddress(account) : "Connect Wallet"}
            </Button>
            {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
        </div>
    );
};
