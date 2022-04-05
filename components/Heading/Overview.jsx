import { Select, Text, useTheme } from '@geist-ui/core'
import DateRangePicker from '../Date/RangePicker'

const HeadingOverview = ({
  initialDateRange,
  onDateRangeChange,
  selectionDates,
  introducers,
  onIntroducerChange,
}) => {
  const theme = useTheme()

  return (
    <>
      <div className="heading__wrapper">
        <div className="heading">
          <div className="heading__name">
            <div className="heading__title">
              <Text h2 className="heading__title-text">
                Overview
              </Text>
            </div>
            <div className="heading__actions">
              <DateRangePicker
                onChange={onDateRangeChange}
                initialDateRange={initialDateRange}
                selectionDates={selectionDates}
              />
              <Select
                className="introducerSelect"
                initialValue="All"
                onChange={(value) => onIntroducerChange(value)}
              >
                <Select.Option value="All">All</Select.Option>
                {
                  introducers.map((introducer, i) => (
                    <Select.Option key={i} value={introducer}>{introducer}</Select.Option>
                  ))
                }
              </Select>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .heading__wrapper {
          border-bottom: 1px solid ${theme.palette.border};
        }
        .heading {
          display: flex;
          flex-direction: row;
          width: ${theme.layout.pageWidthWithMargin};
          max-width: 100%;
          margin: 0 auto;
          padding: calc(${theme.layout.gap} * 2) ${theme.layout.pageMargin};
          box-sizing: border-box;
        }
        .heading__title {
          display: flex;
          flex-direction: row;
          align-items: center;
          flex: 1;
        }
        .heading__name {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
        }
        .heading__name :global(.heading__title-text) {
          line-height: 1;
        }
        .heading__actions {
          display: flex;
        }
        .heading__actions :global(.introducerSelect) {
          margin-left: calc(${theme.layout.unit} / 2);
        }
        @media (max-width: ${theme.breakpoints.xs.max}) {
          .heading__name :global(.heading__title-text) {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  )
}

export default HeadingOverview

/*
import NextLink from 'next/link'
import { Button, Description, Tag, Text, useTheme } from '@geist-ui/react'

const HeadingApplication = ({ name, status, source, amount, term, purpose, customer_id, loan_id }) => {
  const theme = useTheme()

  return (
    <>
      <div className="heading__wrapper">
        <div className="heading">
          <div className="heading__name">
            <div className="heading__title">
              <Text h2 className="heading__name">{name}</Text>
              <Tag className="heading__status">{status}</Tag>
              <div className="heading__actions">
                <NextLink href={`/customer/${customer_id}`} passHref>
                  <a>
                   <Button auto mr={1}>
                    View Customer
                   </Button>
                 </a>
               </NextLink>
                {loan_id &&
                  <NextLink href={`/loans/${loan_id}`} passHref>
                    <a>
                      <Button type="secondary" auto>
                        View Loan
                      </Button>
                    </a>
                  </NextLink>
                }
              </div>
            </div>
            <Description
              title={source}
              content={`£${amount} | ${term} months | ${purpose}`}
            />
          </div>
        </div>
      </div>
      <style jsx>{`
        .heading__wrapper {
          border-bottom: 1px solid ${theme.palette.border};
        }
        .heading {
          display: flex;
          flex-direction: row;
          width: ${theme.layout.pageWidthWithMargin};
          max-width: 100%;
          margin: 0 auto;
          padding: calc(${theme.layout.gap} * 2) ${theme.layout.pageMargin};
          box-sizing: border-box;
        }
        .heading__title {
          display: flex;
          flex-direction: row;
          align-items: center;
          flex: 1;
        }
        .heading__name {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
        }
        .heading__name :global(.heading__name) {
          line-height: 1;
        }
        .heading__name :global(.heading__status) {
          background: ${theme.palette.accents_1};
          border-color: ${theme.palette.accents_2};
          border-radius: 1rem;
          padding: 0.175rem 0.5rem;
          height: unset;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          margin-left: ${theme.layout.gapQuarter};
        }
        .heading__actions {
          margin-left: auto;
        }
        @media (max-width: ${theme.breakpoints.xs.max}) {
          .heading__name :global(.heading__username) {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  )
}

export default HeadingApplication
*/