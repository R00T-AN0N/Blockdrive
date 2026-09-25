import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

const WalletContext = createContext(null);

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [error, setError] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    // Check for existing connection on mount
    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window.ethereum !== "undefined") {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const accounts = await provider.listAccounts();

                    if (accounts.length > 0) {
                        setAccount(accounts[0].address);
                        setIsConnected(true);
                    }
                } catch (err) {
                    console.error("Failed to check wallet connection:", err);
                }
            }
        };

        checkConnection();
    }, []);

    // Listen for account changes
    useEffect(() => {
        if (typeof window.ethereum !== "undefined") {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    setIsConnected(true);
                } else {
                    setAccount(null);
                    setIsConnected(false);
                }
            };

            const handleChainChanged = () => {
                window.location.reload();
            };

            window.ethereum.on("accountsChanged", handleAccountsChanged);
            window.ethereum.on("chainChanged", handleChainChanged);

            return () => {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
                window.ethereum.removeListener("chainChanged", handleChainChanged);
            };
        }
    }, []);

    const connectWallet = async () => {
        setError("");
        if (typeof window.ethereum !== "undefined") {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();

                setAccount(address);
                setIsConnected(true);
            } catch (err) {
                console.error("Error connecting wallet:", err);
                setError("Failed to connect wallet. Please try again.");
            }
        } else {
            setError("MetaMask is not installed. Please install it to use this feature.");
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setIsConnected(false);
    };

    const value = {
        account,
        isConnected,
        error,
        connectWallet,
        disconnectWallet
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};
