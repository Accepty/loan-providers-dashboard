import { useEffect, useReducer } from 'react'
import { Button, Description, Divider, Grid, Popover, Spacer, Text, useTheme } from '@geist-ui/core'
import { getDateStringFromTimestamp, getMonthDetails, monthMap } from '@/helpers/dates'

import ChevronLeft from '@geist-ui/icons/chevronLeft'
import ChevronRight from '@geist-ui/icons/chevronRight'
import XCircle from '@geist-ui/icons/xCircle'
import Calendar from '@/icons/calendar'

/*
  MAYBE TODO
  initialDate should be ISO date, not timestamp.

  datePicker Button could show the text "4 Jan 2022" instead of ISO 8601 (e.g. "2022-01-04").

  datePicker__date text could be formatted as DD/MM/YYYY.

  Start from Monday rather than Sunday.

  NOTES:
  The code is using local time (I think), not UTC.

  Can't update date by typing into the date picker. To do so, import createRef from React, change
  datepicker button to input, add onChange=(updateDateFromInput) and ref={inputRef}, and follow
  comments labelled "For editing date in input."

  Used this:
  https://medium.com/swlh/build-a-date-picker-in-15mins-using-javascript-react-from-scratch-f6932c77db09

  Refactored using this:
  https://dev.to/mirmayne/refactoring-build-a-date-picker-in-15mins-using-javascript-react-from-scratch-3a9d

  This might also be useful:
  https://blog.logrocket.com/react-datepicker-217b4aa840da/
*/

const date = new Date()
const oneDay = 60 * 60 * 24 * 1000
const todayTimestamp = date.getTime() - (date.getTime() % oneDay) + (date.getTimezoneOffset() * 1000 * 60)

const initialState = {
  todayTimestamp,
  year: date.getFullYear(),
  month: date.getMonth(),
  selectedDate: todayTimestamp,
  selectedDateISO: getDateStringFromTimestamp(todayTimestamp),
  monthDetails: getMonthDetails(date.getFullYear(), date.getMonth()),
}

const DatePicker = ({ initialDate, onChange }) => {
  const theme = useTheme()
  // const inputRef = createRef() // For editing date in input.
  const [state, dispatch] = useReducer(reducer, initialState)

  const isCurrentDate = (timestamp) => timestamp === todayTimestamp
  const isAfterCurrentDate = (timestamp) => timestamp > todayTimestamp
  const isCurrentMonth = (monthDetails) => monthDetails.filter((el) => el.date === 1 && el.month === 1)[0].timestamp > todayTimestamp
  const isSelectedDate = (timestamp) =>  timestamp === state.selectedDate
  const getMonthStr = (month) => monthMap[Math.max(Math.min(11, month), 0)] || 'Month'

  useEffect(() => {
    if (initialDate) {
      dispatch({ type: 'selectedDate', value: initialDate })
      dispatch({ type: 'selectedDateISO', value: getDateStringFromTimestamp(initialDate) })
    }
  }, [])

  /* For editing date in input.
  const setDateToInput = (timestamp) => {
    const dateString = getDateStringFromTimestamp(timestamp)
    inputRef.current.value = dateString
  }
  */

  const setDateToDatePicker = (timestamp) => {
    const dateString = getDateStringFromTimestamp(timestamp)
    dispatch({ type: 'selectedDateISO', value: dateString })
  }

  const onDateClick = (date) => {
    setDateToDatePicker(date.timestamp) // Delete for editing date in input.
    // setDateToInput(date.timestamp) // For editing date in input.
    dispatch({ type: 'selectedDate', value: date.timestamp })
    onChange(date.timestamp) // Pass data to parent.
  }

  const clearSelectedDate = () => {
    dispatch({ type: 'selectedDateISO', value: null })
    dispatch({ type: 'selectedDate', value: null })
    // onChange(null) // Uncomment to pass null to parent on clear.
  }

  const resetCalendar = () => {
    const year = date.getFullYear()
    const month = date.getMonth()

    dispatch({ type: 'year', value: year })
    dispatch({ type: 'month', value: month })
    dispatch({ type: 'monthDetails', value: getMonthDetails(year, month) })
  }

  const setMonth = (offset) => {
    let year = state.year
    let month = state.month + offset

    if (month === -1) {
        month = 11
        year--
    } else if (month === 12) {
        month = 0
        year++
    }

    dispatch({ type: 'year', value: year })
    dispatch({ type: 'month', value: month })
    dispatch({ type: 'monthDetails', value: getMonthDetails(year, month) })
  }

  /* For editing date in input.
  const getDateFromDateString = (dateValue) => {
    const dateData = dateValue.split('-').map(d => parseInt(d, 10))

    if (dateData.length < 3) {
      return null
    }

    const year = dateData[0]
    const month = dateData[1]
    const date = dateData[2]

    return {year, month, date}
 }

  const setDate = (dateData) => {
    const selectedDate = new Date(dateData.year, dateData.month - 1, dateData.date).getTime()
    dispatch({type: 'selectedDate', value: selectedDate})
    onChange(selectedDate) // Pass data to parent.
  }

  const updateDateFromInput = () => {
    const dateValue = inputRef.current.value
    const dateData = getDateFromDateString(dateValue)

    if (dateData !== null) { 
        setDate(dateData)
        dispatch({type: 'year', value: dateData.year})
        dispatch({type: 'month', value: dateData.month - 1})
        dispatch({type: 'monthDetails', value: getMonthDetails(dateData.year, dateData.month - 1)})
    }
  }
  */

  const popover = () => (
    <div className="datePicker__container">
      <Description
        title="Date"
        content={
          <div className="datePicker__dateContainer">
            <Text
              h4
              className={
                'datePicker__date' +
                (state.selectedDateISO ? '' : ' datePicker__dateNotSelected')
              }
            >
              {state.selectedDateISO || 'YYYY-MM-DD'}
            </Text>
            <Button
              auto
              className="datePicker__resetButton"
              icon={<XCircle />}
              onClick={() => clearSelectedDate()}
            />
          </div>
        }
      />
      <Divider className="datePicker__fullDivider" />
      <Spacer h={2}/>
      <Grid.Container alignItems="center">
        <Grid xs={16}>
          <Text h2 className="datePicker__currentMonth">{getMonthStr(state.month)} {state.year}</Text>
        </Grid>
        <Grid xs={8} justify="flex-end">
          <Button
            auto
            className="datePicker__arrowButton"
            icon={<ChevronLeft />}
            onClick={() => setMonth(-1)}
          />
          <Spacer w={2}/>
          <Button
            auto
            className="datePicker__resetButton"
            onClick={()=> resetCalendar()}
          >
            <Calendar />
          </Button>
          <Spacer w={2}/>
          <Button
            auto
            className="datePicker__arrowButton"
            disabled={isCurrentMonth(state.monthDetails)}
            icon={<ChevronRight />}
            onClick={()=> setMonth(1)}
          />
        </Grid>
      </Grid.Container>
      <Spacer h={.25}/>
      <Divider />
      <Spacer h={.75}/>
      <div className="calendar__grid">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
          <div className="calender__day" key={i}>{day}</div>
        ))}
        {state.monthDetails.map((date, i) => (
          <div className={
              ((isAfterCurrentDate(date.timestamp) ?
              ' calendar__dateWrapperDisabled' :
              ' calendar__dateWrapper'))
            }
            key={i}
          >
            <div
              className={((isAfterCurrentDate(date.timestamp) ? ' calendar__disabled' : ''))}
              onClick={() => onDateClick(date)}
              role="button"
            >
              <Text
                className={
                  'calendar__date' +
                  ((date.month !== 0) ? ' calendar__outsideMonth' : '') +
                  ((isCurrentDate(date.timestamp) ? ' calendar__highlight' : '')) +
                  ((isSelectedDate(date.timestamp) ? ' calendar__selected' : ''))
                }
                span
                tabIndex="-1"
              >
                {date.date}
              </Text>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        :global(.tooltip-content.popover > .inner) {
          min-width: 300px;
          padding: ${theme.layout.gapHalf};
        }

        .datePicker__dateContainer {
          display: flex;
        }

        .datePicker__container :global(.datePicker__date) {
          line-height: 1.5;
          margin-top: calc(${theme.layout.unit} / 2);
          margin-right: auto;
        }

        .datePicker__container :global(.datePicker__dateNotSelected) {
          color: ${theme.palette.accents_3};
        }

        .datePicker__container :global(.datePicker__fullDivider) {
          margin: 0 ${theme.layout.gapHalfNegative};
          max-width: 200% !important;
        }

        .datePicker__container :global(.datePicker__currentMonth) {
          display: block; /* TODO is this needed */
          font-size: .75rem;
          font-weight: 500;
          margin: 0;
          text-transform: uppercase;
          max-width: 100%; /* TODO is this needed */
        }

        .datePicker__container :global(.datePicker__arrowButton) {
          border: 0;
          border-radius: 50%;
          height: auto;
          line-height: 0;
          margin: auto;
          padding: 2px;
        }

        .datePicker__container :global(.datePicker__arrowButton[disabled]) {
          background-color: ${theme.palette.background};
          --geist-ui-button-color: ${theme.palette.accents_3};
        }

        .datePicker__container :global(.datePicker__resetButton) {
          color: ${theme.palette.accents_5};
          border: 0;
          border-radius: 0;
          height: auto;
          line-height: 0;
          padding: 4px;
        }

        .datePicker__container :global(.datePicker__resetButton:hover ) {
          color: ${theme.palette.foreground};
        }

        .datePicker__container :global(.datePicker__resetWrapper) {
          display: flex;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .calendar__grid {
          display: grid;
          grid-row-gap: calc(${theme.layout.unit} / 2);
          grid-template-columns: repeat(7, 1fr);
          justify-content: center;
        }

        .calender__day {
          min-width: 36px;
          text-align: center;
          padding: 0;
          font-size: .75rem;
          font-weight: 500;
          color: ${theme.palette.accents_5};
          text-transform: uppercase;
        }

        .calendar__dateWrapper {
          cursor: pointer;
        }

        .calendar__dateWrapperDisabled {
          cursor: not-allowed;
        }

        .datePicker__container :global(.calendar__date) {
          border: 1px solid transparent;
          border-radius: 50%;
          outline: none;
          display: block;
          line-height: 22px;
          width: 24px;
          height: 24px;
          font-size: 12px;
          font-weight: 500;
          margin: auto;
          text-align: center;
          z-index: 1;
        }

        .datePicker__container :global(.calendar__date:hover:not(.calendar__disabled)) {
          border-color: ${theme.palette.success};
        }

        .datePicker__container :global(.calendar__date:focus) {
          box-shadow: 0 0 0 1px ${theme.palette.background},
            0 0 0 3px ${theme.palette.success};
        }

        .datePicker__container :global(.calendar__outsideMonth),
        .datePicker__container :global(.calendar__disabled) {
          color: ${theme.palette.accents_3};
        }

        .datePicker__container :global(.calendar__disabled) {
          pointer-events: none;
        }

        .datePicker__container :global(.calendar__highlight) {
          background: ${theme.palette.error};
          color: #fff;
        }

        .datePicker__container :global(.calendar__selected) {
          background: ${theme.palette.success};
          color: #fff;
        }

        .calendar_table thead, .calendar_table tbody {
          display: block;
        }

        .calendar_table tr {
          display: flex;
          flex-wrap: nowrap;
          margin: calc(${theme.layout.unit} / 2) 0;
        }

        .calendar_table th {
          min-width: 36px;
          flex: 1 1;
          text-align: center;
          padding: 0;
          font-size: .75rem;
          font-weight: 500;
          color: ${theme.palette.accents_5};
          text-transform: uppercase;
        }

        .calendar_table td {
          flex: 1 1;
          display: flex;
          justify-content: center;
          width: calc(${theme.layout.unit} * 3);
          height: calc(${theme.layout.unit} * 3);
          padding: 0;
          text-align: center;
          cursor: pointer;
        }

        .calendar_table td span.calendar_disabled,
        .calendar_table td span.calendar_outsideMonth {
          color: ${theme.palette.accents_3}
        }

        .calendar_table td span {
          z-index: 1;
          outline: none;
          display: block;
          line-height: 22px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
          border: 1px solid transparent;
          margin: 0;
        }
      `}</style>
    </div>
  )

  return (
    <div className="datePicker">
      <Popover content={popover}>
        <Button
          className="datePicker__popoverButton"
          icon={<Calendar />}
        >
          {state.selectedDateISO || 'Select Date'}
        </Button>
      </Popover>
      <style jsx>{`
        .datePicker :global(.datePicker__popoverButton) {
          height: calc(2.25 * ${theme.layout.unit});
          text-align: left;
        }

        .datePicker :global(.datePicker__popoverButton .text) {
          margin-left: ${theme.layout.unit};
        }
      `}</style>
    </div>
  )
}

function reducer(state, action) {
  if (state.hasOwnProperty(action.type)) {
    return {
      ...state,
      [`${action.type}`]: action.value
    }
  }

  console.log(`Unknown key in state: ${action.type}`)
}

export default DatePicker
