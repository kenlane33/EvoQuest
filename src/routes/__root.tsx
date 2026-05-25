import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { AppHydrator } from '@/components/AppHydrator'
import { BASE_GOOGLE_FONTS_URL } from '@/lib/google-fonts'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Biology' },
      { name: 'description', content: 'Understanding-growth study for high school biology.' },
      { name: 'color-scheme', content: 'dark' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'stylesheet',
        href: BASE_GOOGLE_FONTS_URL,
        crossOrigin: 'anonymous',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-body antialiased selection:bg-[color-mix(in_oklab,var(--accent-violet)_30%,transparent)]">
        <AppHydrator>
          <div id="app" className="min-h-screen">
            {children ?? <Outlet />}
          </div>
        </AppHydrator>
        <Scripts />
      </body>
    </html>
  )
}
