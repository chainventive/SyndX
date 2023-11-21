import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SyndX',
  description: 'SyndX dApp',
}

// RainbowKit / Wagmi

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { hardhat, sepolia, polygon } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient } = configureChains (
  [ hardhat /* sepolia polygon */ ],
  [ alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY }), publicProvider() ]
);

const { connectors } = getDefaultWallets({
  appName   : process.env.WALLET_CONNECT_PROJECT_NAME,
  projectId : process.env.NEXT_PUBLIC_WALLET_CONNECT_ID,
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
            {children}
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}
