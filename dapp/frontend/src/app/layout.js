"use client"

require('dotenv').config();
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

// Chakra UI
import { ChakraProvider } from '@chakra-ui/react'

// RainbowKit / Wagmi
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { hardhat, sepolia, polygonMumbai } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

// Backend
import { backend } from "@/backend";

// Contexts
import { SyndxContextProvider } from '@/app/contexts/syndx/syndx.context.jsx';

const { chains, publicClient } = configureChains (
  //[ polygonMumbai ],
  [ backend.network == 'hardhat' ? hardhat : sepolia ],
  [ alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY }), publicProvider() ]
);

const { connectors } = getDefaultWallets({
  appName   : process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_NAME,
  projectId : process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  chains
});

const wagmiConfig = createConfig({
  autoConnect : false, // be careful with true
  connectors,
  publicClient
});

// RootLayout

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <SyndxContextProvider>
              <ChakraProvider>
                {children}
              </ChakraProvider>
            </SyndxContextProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}
