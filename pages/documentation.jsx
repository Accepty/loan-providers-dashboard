import React from 'react'
import { useTheme } from '@geist-ui/core'
import { RedocStandalone } from 'redoc'

// TODO insights/shares documentation.

const Documentation = () => {
  const theme = useTheme()

  return (
    <>
      <RedocStandalone
        specUrl="/documentation/loan-providers-insights.json"
        options={
          (theme.type === 'darkAccepty') ?
            {
              theme: {
                colors: {
                  primary: { main: '#3cd37c' },
                  text: { primary: '#cccccc' },
                },
                sidebar: {
                  backgroundColor: '#141414',
                  textColor: '#666666',
                },
                rightPanel: {
                  backgroundColor: '#15251d',
                  textColor: '#999999',
                },
                typography: {
                  fontFamily:
                    '"Gilroy-Medium", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                  headings: {
                    fontFamily:
                      '"Gilroy-Medium", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                    color: '#fff',
                  },
                },
              },
            } :
            {
              theme: {
                colors: {
                  primary: { main: '#3cd37c' },
                },
                rightPanel: {
                  backgroundColor: '#15251d',
                  textColor: '#999999',
                },
                typography: {
                  fontFamily:
                    '"Gilroy-Medium", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                  headings: {
                    fontFamily:
                      '"Gilroy-Medium", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                    color: '#fff',
                  },
                },
              },
            }
        }
      />
      <style jsx>{`
        .htOGOk {
          color: #cccccc !important;
        }
        
        .eBUmia {
          color: #999999 !important;
        }
        
        .ejbveP {
          color: #999999 !important;
        }
      `}</style>
    </>
  )
}

Documentation.auth = true
export default Documentation