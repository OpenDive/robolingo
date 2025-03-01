"use client"

import "./globals.css";
import { WalletProvider } from "@/contexts/WalletContext";
import { ChallengeProvider } from "@/contexts/ChallengeContext";
import { SuiWalletAdapter } from "@/components/wallet/SuiWalletAdapter";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={roboto.className}>
        <SuiWalletAdapter>
          <WalletProvider>
            <ChallengeProvider>
              {children}
            </ChallengeProvider>
          </WalletProvider>
        </SuiWalletAdapter>
      </body>
    </html>
  );
}