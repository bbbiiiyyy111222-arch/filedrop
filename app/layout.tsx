export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, background: '#111' }}>{children}</body>
    </html>
  )
}
