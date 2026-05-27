import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QCRC Team Management",
  description: "Rowing club reservations, sign-out, and damage tracking",
  icons: {
    icon: "/qcrc-lockup.svg",
  },
  manifest: "/manifest.webmanifest",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
