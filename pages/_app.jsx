import { useState } from 'react'
import Head from 'next/head'
import { SessionProvider, useSession } from 'next-auth/react'
import { CssBaseline, GeistProvider, Loading, Themes } from '@geist-ui/core'
import NavigationMenu from '@/components/Navigation/Menu'
import NavigationFooter from '@/components/Navigation/Footer'
import '../styles/globals.css'

function App({ Component, pageProps }) {
  const darkTheme = Themes.createFromDark({
    type: 'darkAccepty',
    palette: {
      success: '#3CD37C',
    },
  })
  const lightTheme = Themes.createFromLight({
    type: 'lightAccepty',
    palette: {
      success: '#3CD37C',
    },
  })
  const [themeType, setThemeType] = useState('darkAccepty')
  const switchTheme = () => setThemeType(last => (last === 'darkAccepty' ? 'lightAccepty' : 'darkAccepty'))

  return (
    <GeistProvider themes={[lightTheme, darkTheme]} themeType={themeType}>
      <CssBaseline />
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
        />
      </Head>
      <SessionProvider session={pageProps.session}>
        {Component.auth ? (
          <Auth>
            <NavigationMenu switchTheme={switchTheme} />
              <main>
                <Component {...pageProps} />
              </main>
            <NavigationFooter />
          </Auth>
        ) : (
          <main>
            <Component {...pageProps} />
          </main>
        )}
      </SessionProvider>
    </GeistProvider>
  )
}

function Auth({ children }) {
  const { data: session } = useSession({ required: true })
  const isUser = !!session?.user

  if (isUser) {
    return children
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect (dunno where this useEffect() is?).
  // It seems the required: true option is redirecting to sign in page.
  return (
    <>
      <div className="loading__wrapper">
        <Loading />
      </div>
      <style jsx>{`
        .loading__wrapper {
          display: flex;
          justify-content: center;
          margin: auto;
          height: 70vh;
        }
      `}</style>
    </>
  )
}

export default App
