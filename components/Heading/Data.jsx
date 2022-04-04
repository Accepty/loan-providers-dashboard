import { Button, Text, useTheme } from '@geist-ui/core'
import DateRangePicker from '../Date/RangePicker'

const HeadingData = ({
  initialDateRange,
  onDateRangeChange,
  selectionDates,
  onDownloadCSV,
  data,
  downloadRef,
  title
}) => {
  const theme = useTheme()

  return (
    <>
      <div className="heading__wrapper">
        <div className="heading">
          <div className="heading__name">
            <div className="heading__title">
              <Text h2 className="heading__title-text">
                Data
              </Text>
            </div>
            <div className="heading__actions">
              <DateRangePicker
                onChange={onDateRangeChange}
                initialDateRange={initialDateRange}
                selectionDates={selectionDates}
              />
              <div className="download__button">
                <Button
                  auto
                  disabled={!data}
                  height="36px"
                  onClick={() => onDownloadCSV(data, downloadRef, title)}
                  type="secondary"
                >
                  Download
                </Button>
              </div>
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
        .heading__name {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
        }
        .heading__title {
          display: flex;
          flex-direction: row;
          align-items: center;
          flex: 1;
        }
        .heading__name :global(.heading__title-text) {
          line-height: 1;
        }
        .heading__actions {
          display: flex;
        }
        .heading__actions .download__button {
          margin-left: auto;
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

export default HeadingData