import type { Metadata, Viewport } from "next";
import { Exo_2, Orbitron } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { PwaRegister } from "@/components/PwaRegister";

const sans = Exo_2({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-serif",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: {
    template: "%s | Anistreamz",
    default: "Anistreamz",
  },
  description: "Anistreamz is a Best anime streaming web interface.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Anistreamz",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} antialiased selection:bg-secondary selection:text-white dark:selection:text-black`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          enableColorScheme={false}
          disableTransitionOnChange
        >
          <PwaRegister />
          <AppLayout>{children}</AppLayout>
          <Toaster 
            theme="dark" 
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: '!bg-card !border !font-mono !rounded-none',
                success: '!border-secondary !text-secondary !shadow-[0_0_20px_rgba(34,197,94,0.25)]',
                error: '!border-danger !text-danger !shadow-[0_0_20px_rgba(239,68,68,0.25)]',
                info: '!border-blue-500 !text-blue-500 !shadow-[0_0_20px_rgba(59,130,246,0.25)]',
                description: '!text-muted-text !text-[10px] uppercase tracking-widest',
                icon: '!w-10 !h-10 !m-0 !static !bg-transparent',
                content: '!pl-2',
              },
              style: {
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
              }
            }} 
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
