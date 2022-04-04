import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { Card, Dot, Spacer, Spinner, Text, useTheme } from '@geist-ui/core'
import CollapseInsights from '@/components/Collapse/Insights'
import HeadingOverview from '@/components/Heading/Overview'
import { getDateStringFromTimestamp } from '@/helpers/dates'
import useLoansInsightsShares from '@/hooks/use-loans-insights-shares'

const PieChart = dynamic(() => import('@opd/g2plot-react').then(({ PieChart }) => PieChart), { ssr: false })
const BarChart = dynamic(() => import('@opd/g2plot-react').then(({ BarChart }) => BarChart), { ssr: false })

/*
  NOTES
  This will break if the same lender returns more than one kind of product.
  const lenderDataTemp = data.result.filter((obj) => obj.lender_id) and enderDataTemp.length === 1
  in useEffect() will need to be changed to use loansApiCreds.username as the length of the array
  for a lender with more than one product will also be more than one.
  
  TODO

  Do not share names of lenders, do not use pseudonyms either.
  Do not show performance on channels where that lender is not live.

  Overview:
  Nth position this month in terms of app/quote rate.
  Nth position this month in terms of quote/redirect rate.
  Nth position this month in terms of app/redirect rate.
  Nth position this month in terms of redirect/completion rate.
  Nth position this month in terms of app/completion rate.

  Data:
  Table of lender quoted and not quoted (erros are not quoted).
  Filter by date, source, status (quoted/not quoted).

  Applications:
  Bar chart of where traffic is coming from by source.
  Filter by date

  Quotes
  Bar chart out of 100% of who is quoting.
  Filter by date, source.

  Redirects
  Pie chart of where redirects are going to.
  Filter by date, source, status (quoted/not quoted).

  Completions
  Bar chart out of 100% of redirect/completion rates.
  Filter by date, source, status (quoted/not quoted).

  Change color of insights icon depending on whether lender lands in top, middle, bottom third of overall
  products.
*/

const Home = () => {
  const theme = useTheme()
  const { data: session } = useSession()

  const loansApiCreds = { 
    username: session.user.username,
    password: session.user.password,
  }

  const now = new Date()
  const todayTimestamp = new Date(now.toISOString().slice(0,10)).getTime()
  const yesterdayTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime()
  const _7DaysAgoTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getTime()
  const _14DaysAgoTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14).getTime()
  const _30DaysAgoTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).getTime()
  const initialDateRange = [yesterdayTimestamp, todayTimestamp]
  const selectionDates = {
    'Last 7 Days': [_7DaysAgoTimestamp, todayTimestamp],
    'Last 14 Days': [_14DaysAgoTimestamp, todayTimestamp],
    'Last 30 Days': [_30DaysAgoTimestamp, todayTimestamp],
  }

  const [dateRange, setDateRange] = useState([
    getDateStringFromTimestamp(yesterdayTimestamp),
    getDateStringFromTimestamp(todayTimestamp),
  ])
  const [client, setClient] = useState('')
  const [pieData, setPieData] = useState([])
  const [barData, setBarData] = useState([])
  const [lenderUserProduct, setLenderUserProduct] = useState('n/a')
  const [lenderUserPieData, setLenderUserPieData] = useState({})
  const [lenderUserProductPieData, setLenderUserProductPieData] = useState([])
  const [lenderUserBarData, setLenderUserBarData] = useState([])
  const [lenderUserProductBarData, setLenderUserProductBarData] = useState([])
  const { data, isLoading, isError } = useLoansInsightsShares(
    loansApiCreds,
    dateRange[0],
    dateRange[1],
    client,
  )

  useEffect(() => {
    if (!data) return

    const lenderDataTemp = data.result.filter((obj) => obj.lender_id)
    const formattedPieData = data.result.map((obj) => (
      { 
        ...obj,
        lender_id_product: (obj.lender_id)
          ? `${obj.lender_id} (${obj.product.replace(/_/g, ' ')})`
          : `${(Math.random() + 1).toString(36).substring(9)} (${obj.product})`,
      }
    ))
    const formattedBarData = formattedPieData.map((obj) => [{
      lender_id: obj.lender_id,
      product: obj.product,
      lender_id_product: obj.lender_id_product,
      stage: 'application/quote',
      value: Math.round((obj.quotes / obj.applications) * 100) || 0,
    },
    {
      lender_id: obj.lender_id,
      product: obj.product,
      lender_id_product: obj.lender_id_product,
      stage: 'quote/redirect',
      value: Math.round((obj.redirects / obj.quotes) * 100) || 0,
    },
    {
      lender_id: obj.lender_id,
      product: obj.product,
      lender_id_product: obj.lender_id_product,
      stage: 'redirect/completion',
      value: Math.round((obj.completions / obj.redirects) * 100) || 0,
    }]).flat()

    setPieData(formattedPieData)
    setBarData(formattedBarData)

    if (lenderDataTemp.length === 1) {
      setLenderUserPieData(lenderDataTemp[0])
      setLenderUserProductPieData(formattedPieData.filter((obj) => obj.product === lenderDataTemp[0].product))
      setLenderUserBarData(formattedBarData.filter((obj) => obj.lender_id === lenderDataTemp[0].lender_id))
      setLenderUserProductBarData(formattedBarData.filter((obj) => obj.product === lenderDataTemp[0].product))
      setLenderUserProduct(lenderDataTemp[0].product.replace(/_/g, ' '))
    }
  }, [data])

  const onDateRangeChange = (timestamps) => {
    setDateRange(timestamps.map((timestamp) => getDateStringFromTimestamp(timestamp)))
  }

  const getShareRank = (data, value) => {
    const rank = data.filter((obj) => obj.applications > value).length + 1
    const percentile = rank / data.length * 100
    let percentileSet = 'error'

    if (percentile <= 33.3) {
      percentileSet = 'success'
    } else if (percentile <= 66.6) {
      percentileSet = 'warning'
    }

    return {
      percentileSet,
      rank,
    }
  }

  const getConversionRank = (data, value, conversionStage, numLenders) => {
    const rank = data.filter((obj) => obj.stage === conversionStage && obj.value > value).length + 1
    const percentile = rank / numLenders * 100
    let percentileSet = 'error'
    
    if (percentile <= 33.3) {
      percentileSet = 'success'
    } else if (percentile <= 66.6) {
      percentileSet = 'warning'
    }
  
    return {
      percentileSet,
      rank,
    }
  }

  const chartsThemeConfig = {
    theme: {
      components: {
        legend: {
          common: {
            itemName: {
              style: {
                fill: theme.palette.accents_5,
              },
            },
            itemStates: {
              unchecked: {
                nameStyle: {
                  fill: theme.palette.accents_2,
                },
                markerStyle: {
                  fill: theme.palette.accents_2,
                  stroke: theme.palette.accents_2,
                },
              },
            },
            pageNavigator: {
              marker: {
                style: {
                  inactiveFill: theme.palette.accents_3,
                  fill: theme.palette.accents_3,
                }
              },
              text: {
                style: {
                  fill: theme.palette.accents_5,
                  fontSize: 12
                },
              },
            },
          },
        },
        tooltip: {
          domStyles: {
            'g2-tooltip': {
              backgroundColor: theme.palette.accents_2,
              boxShadow: '0px 2px 4px rgba(0,0,0,.5)',
            },
          },
        },
        scrollbar: {
          common: {
            padding: [8, 8, 8, 8]
          },
          default: {
            style: {
              trackColor: 'rgba(255,255,255,0.65)',
              thumbColor: 'rgba(0, 0, 0, 0.35)',
            }
          },
          hover: {
            style: {
              thumbColor: 'rgba(0,0,0,0.45)',
            },
          },
        },
      },
      innerLabels: {
        style: {
          fill: theme.palette.accents_1,
        },
      },
    },
  }

  const pieChartConfig = {
    appendPadding: 16,
    height: 360,
    label: {
      type: 'inner',
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
    },
    ...chartsThemeConfig,
  }

  const configApplications = {
    angleField: 'applications',
    colorField: 'lender_id_product',
    ...pieChartConfig,
  }

  const configQuotes = {
    angleField: 'quotes',
    colorField: 'lender_id_product',
    ...pieChartConfig,
  }

  const configRedirects = {
    angleField: 'redirects',
    colorField: 'lender_id_product',
    ...pieChartConfig,
  }

  const configCompletions = {
    angleField: 'completions',
    colorField: 'lender_id_product',
    ...pieChartConfig,
  }

  const barChartConfig = {
    isGroup: true,
    xField: 'value',
    yField: 'lender_id_product',
    seriesField: 'stage',
    marginRatio: 0,
    label: {
      position: 'middle',
      layout: [
        { type: 'interval-adjust-position' },
        { type: 'interval-hide-overlap' },
        { type: 'adjust-color' },
      ],
    },
    barStyle: { radius: [2, 2, 0, 0] },
    scrollbar: {
      type: 'vertical',
    },
    ...chartsThemeConfig,
  }

  return (
    <>
      <HeadingOverview
        initialDateRange={initialDateRange}
        onDateRangeChange={onDateRangeChange}
        selectionDates={selectionDates}
      />
      <div className="page__wrapper">
        <div className="page__content">
          <Card>
            <Card.Content>
            <Text h4 my={0}>Shares</Text>
            <Text p type="secondary" my={0}>
              Your share of applications, quotes, redirects and completions.
            </Text>
            </Card.Content>
            <CollapseInsights>
              {(lenderUserPieData.lender_id) &&
                <div className="insights">
                  <div className="insight">
                    <Dot type={getShareRank(pieData, lenderUserPieData.applications).percentileSet} />
                    <Text span>
                      For application share, {lenderUserPieData.lender_id} is ranked {getShareRank(pieData, lenderUserPieData.applications).rank} out of {pieData.length} overall and {getShareRank(lenderUserProductPieData, lenderUserPieData.applications).rank} out of {lenderUserProductPieData.length} in the {lenderUserProduct} product category.
                    </Text>
                  </div>
                  <div className="insight">
                    <Dot type={getShareRank(pieData, lenderUserPieData.quotes).percentileSet} />
                    <Text span>
                      For quote share, {lenderUserPieData.lender_id} is ranked {getShareRank(pieData, lenderUserPieData.quotes).rank} out of {pieData.length} overall and {getShareRank(lenderUserProductPieData, lenderUserPieData.quotes).rank} out of {lenderUserProductPieData.length} in the {lenderUserProduct} product category.
                    </Text>
                    </div>
                  <div className="insight">
                    <Dot type={getShareRank(pieData, lenderUserPieData.redirects).percentileSet} />
                    <Text span>
                      For redirect share, {lenderUserPieData.lender_id} is ranked {getShareRank(pieData, lenderUserPieData.redirects).rank} out of {pieData.length} overall and {getShareRank(lenderUserProductPieData, lenderUserPieData.quotes).rank} out of {lenderUserProductPieData.length} in the {lenderUserProduct} product category.
                    </Text>
                  </div>
                  <div className="insight">
                    <Dot type={getShareRank(pieData, lenderUserPieData.completions).percentileSet} />
                    <Text span>
                      For completion share, {lenderUserPieData.lender_id} is ranked {getShareRank(pieData, lenderUserPieData.completions).rank} out of {pieData.length} overall and {getShareRank(lenderUserProductPieData, lenderUserPieData.quotes).rank} out of {lenderUserProductPieData.length} in the {lenderUserProduct} product category.
                    </Text>
                  </div>
                </div>
              }
            </CollapseInsights>
            <Card.Content>
              {(isLoading)
                ? <div className="spinner__wrapper">
                    <Spinner />
                  </div>
                : <div className="pie-charts__container">
                    <div>
                      <Text>Applications</Text>
                      <PieChart {...configApplications} data={pieData} />
                    </div>
                    <div>
                      <Text>Quotes</Text>
                      <PieChart {...configQuotes} data={pieData} />
                    </div>
                    <div>
                      <Text>Redirects</Text>
                      <PieChart {...configRedirects} data={pieData} />
                    </div>
                    <div>
                      <Text>Completions</Text>
                      <PieChart {...configCompletions} data={pieData} />
                    </div>
                  </div>
              }
            </Card.Content>
          </Card>
          <Spacer h={2}/>
          <Card>
            <Card.Content>
            <Text h4 my={0}>Conversions</Text>
            <Text p type="secondary" my={0}>
              Your application/quote, quote/redirect, redirect/completion conversion performance.
            </Text>
            </Card.Content>
            <CollapseInsights>
              {(lenderUserPieData.lender_id) &&
                <div className="insights">
                  <div className="insight">
                    <Dot type={getConversionRank(barData, lenderUserBarData[0].value, 'application/quote', pieData.length).percentileSet} />
                    <Text span>
                      For application/quote conversion, {lenderUserPieData.lender_id} is ranked {getConversionRank(barData, lenderUserBarData[0].value, 'application/quote', pieData.length).rank} out of {pieData.length} overall and {getConversionRank(lenderUserProductBarData, lenderUserBarData[0].value, 'application/quote').rank} out of {lenderUserProductPieData.length} in the {lenderUserProduct} product category.
                    </Text>
                  </div>
                  <div className="insight">
                    <Dot type={getConversionRank(barData, lenderUserBarData[0].value, 'quote/redirect', pieData.length).percentileSet} />
                    <Text span>
                      For quote/redirect conversion, {lenderUserPieData.lender_id} is ranked {getConversionRank(barData, lenderUserBarData[0].value, 'quote/redirect', pieData.length).rank} out of {pieData.length} overall and {getConversionRank(lenderUserProductBarData, lenderUserBarData[0].value, 'quote/redirect').rank} out of {lenderUserProductPieData.length} in the {lenderUserProduct} product category.
                    </Text>
                    </div>
                  <div className="insight">
                    <Dot type={getConversionRank(barData, lenderUserBarData[0].value, 'redirect/completion', pieData.length).percentileSet} />
                    <Text span>
                      For redirect/completion conversion, {lenderUserPieData.lender_id} is ranked {getConversionRank(barData, lenderUserBarData[0].value, 'redirect/completion', pieData.length).rank} out of {pieData.length} overall and {getConversionRank(lenderUserProductBarData, lenderUserBarData[0].value, 'redirect/completion').rank} out of {lenderUserProductPieData.length} in the {lenderUserProduct} product category.
                    </Text>
                  </div>
                </div>
              }
            </CollapseInsights>
            <Card.Content>
              {(isLoading)
                ? <div className="spinner__wrapper">
                    <Spinner />
                  </div>
                : <BarChart {...barChartConfig} data={barData} />
              }
            </Card.Content>
          </Card>
        </div>
      </div>
      <style jsx>{`
        .page__wrapper {
          background-color: ${theme.palette.accents_1};
        }
        .page__content {
          width: ${theme.layout.pageWidthWithMargin};
          max-width: 100%;
          margin: 0 auto;
          padding: calc(${theme.layout.unit} * 2) ${theme.layout.pageMargin};
          box-sizing: border-box;
        }
        .insights .insight:not(:last-child) {
          margin-bottom: calc(${theme.layout.unit} / 2);
        }
        .spinner__wrapper :global(.spinner) {
          margin: calc(${theme.layout.unit} * 2) auto;
        }
        .pie-charts__container {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
      `}</style>
    </>
  )
}

Home.auth = true
export default Home