import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button, Pagination, Spinner, Table, useTheme } from '@geist-ui/core'
import HeadingData from '@/components/Heading/Data'
import { getDateStringFromTimestamp } from '@/helpers/dates'
import { sliceIntoChunks } from '@/helpers/utils'
import useLoansInsightsDecisions from '@/hooks/use-loans-insights-decisions'

import ChevronLeft from '@geist-ui/icons/chevronLeft'
import ChevronRight from '@geist-ui/icons/chevronRight'

/*
  TODO
  Add filter on created range (db lookup if outside scope of what's in table).

  Add filter on status (quoted / not quoted). (db lookup)

  Add filter on source. (db lookup)

  TODO MAYBE
  Add search on application id, email, name, postcode, phone. (db lookup, not search in table).
*/

const Data = () => {
  const theme = useTheme()
  const { data: session } = useSession()
  const downloadRef = useRef(null)

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

  const loansApiCreds = { 
    username: session.user.username,
    password: session.user.password,
  }

  const [dateRange, setDateRange] = useState([
    getDateStringFromTimestamp(yesterdayTimestamp),
    getDateStringFromTimestamp(todayTimestamp),
  ])
  const [client, setClient] = useState('')
  const [beforeAfter, setBeforeAfter] = useState('')
  const [tableData, setTableData] = useState([]) 
  const [tablePage, setTablePage] = useState(1)
  
  const { data, isLoading, isError } = useLoansInsightsDecisions(
    loansApiCreds,
    dateRange[0],
    dateRange[1],
    beforeAfter,
    client,
  )

  useEffect(() => {
    if (!data) return
    setTableData(sliceIntoChunks(data.result, 50))
  }, [data])

  const onDateRangeChange = (timestamps) => {
    setDateRange(timestamps.map((timestamp) => getDateStringFromTimestamp(timestamp)))
  }

  const onDownloadCSV = (data, ref, title) => {
    const csvString = encodeURI('data:text/csv;charset=utf-8,' + [
      Object.keys(data.result[0]),
      ...data.result.map((item) => Object.values(item))
    ].map(e => e.join(',')) .join('\n'))

    ref.current.href = csvString
    ref.current.download = title
    ref.current.click()
  }

  return (
    <>
      <HeadingData
        initialDateRange={initialDateRange}
        onDateRangeChange={onDateRangeChange}
        selectionDates={selectionDates}
        onDownloadCSV={onDownloadCSV}
        data={data}
        downloadRef={downloadRef}
        title={`decision-data-${dateRange[0]}-${dateRange[1]}.csv`}
      />
        <div className="page__content">
          {(isLoading)
            ? <div className="spinner__wrapper">
                <Spinner />
              </div>
            : <>
                <Table data={tableData[tablePage - 1] || [[]]} emptyText="-" scale={.25}>
                  <Table.Column prop="client" label="client" />
                  <Table.Column prop="application_id" label="app id" />
                  <Table.Column prop="rank" label="rank" />
                  <Table.Column prop="lender_id" label="lender" />
                  <Table.Column prop="lender_application_id" label="lender app id" />
                  <Table.Column prop="product" label="product" />
                  <Table.Column prop="status" label="status" />
                  <Table.Column prop="approval_probability" label="approval probability" />
                  <Table.Column prop="requested_amount" label="req amount" />
                  <Table.Column prop="requested_term" label="req term" />
                  <Table.Column prop="quoted_amount" label="quo amount" />
                  <Table.Column prop="quoted_term" label="quo term" />
                  <Table.Column prop="apr" label="apr" />
                  <Table.Column prop="apr_type" label="apr type" />
                  <Table.Column prop="submitted_at" label="submitted" />
                  <Table.Column prop="decisioned_at" label="decisioned" />
                  <Table.Column prop="redirected_at" label="redirected" />
                  <Table.Column prop="disbursed_at" label="disbursed" />
                </Table> 
                <div className="pagination">
                  <div className="pagination__button-prev-container">
                    <div hidden={!data?.page.before}>
                      <Button
                        auto
                        className="pagination__button"
                        h={.8}
                        onClick={() => {
                          setTablePage(1)
                          setBeforeAfter(`&before=${data.page.before}`)}
                        }
                      >
                        Prev 1000
                      </Button>
                    </div>
                  </div>
                  <Pagination
                    count={tableData.length}
                    onChange={(page) => setTablePage(page)}
                    page={tablePage}
                  >
                    <Pagination.Next><ChevronRight /></Pagination.Next>
                    <Pagination.Previous><ChevronLeft /></Pagination.Previous>
                  </Pagination>
                  <div className="pagination__button-next-container">
                    <div hidden={!data?.page.after}>
                      <Button
                        auto
                        className="pagination__button"
                        h={.8}
                        onClick={() => {
                          setTablePage(1)
                          setBeforeAfter(`&after=${data.page.after}`)}
                        }
                      >
                        Next 1000
                      </Button>
                    </div>
                  </div>
                </div>
              </>
          }
        </div>
        <a ref={downloadRef} />
      <style jsx>{`
        .page__content {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          width: 924pt; /* ${theme.layout.pageWidthWithMargin};*/
          max-width: 100%;
          margin: 0 auto;
          padding: calc(${theme.layout.unit} * 2) ${theme.layout.pageMargin};
          box-sizing: border-box;
        }
        .spinner__wrapper {
          margin: calc(${theme.layout.unit} * 2) auto;
        }
        .pagination {
          display: grid;
          justify-items: center;
          grid-template-columns: 1fr 2fr 1fr;
          margin: ${theme.layout.unit} auto;
        }
        .pagination .pagination__button-prev-container {
          justify-self: end;
          margin-right: 0.428em;
        }
        .pagination :global(.pagination__button) {
          border: none;
        }
        .pagination .pagination__button-next-container {
          justify-self: start;
        }
      `}</style>
    </>
  )
}

Data.auth = true
export default Data