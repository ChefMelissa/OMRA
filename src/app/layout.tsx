import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "منصة عمرة - مقارنة وحجز برامج العمرة بالجزائر",
  description: "المنصة الأولى لمقارنة عروض وبرامج العمرة من مختلف الوكالات السياحية المعتمدة بالجزائر. تصفح، فلتر، واحجز برنامجك بكل شفافية وسهولة.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
