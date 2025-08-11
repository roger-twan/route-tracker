import type { ReactElement, ReactNode } from 'react'
import type { AppProps } from 'next/app'
import { NextPage } from 'next'
import { GeistProvider, CssBaseline } from '@geist-ui/core'
import 'inter-ui/inter.css'

export type PageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

interface MyAppProps extends AppProps {
  Component: PageWithLayout
}

export default function App({ Component, pageProps }: MyAppProps) {
  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <GeistProvider>
      <CssBaseline />
      {getLayout(<Component {...pageProps} />)}
    </GeistProvider>
  )
}
