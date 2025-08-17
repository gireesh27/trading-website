// app/layout.tsx

import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TradeView - Professional Trading Platform",
  description:
    "Complete stock trading platform with real-time data, advanced charting, and portfolio management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
