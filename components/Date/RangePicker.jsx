import { useEffect, useReducer } from 'react'
import { Button, Description, Divider, Grid, Popover, Select, Spacer, Text, useTheme } from '@geist-ui/core'
import { getDateStringFromTimestamp, getMonthDetails, monthMap } from '@/helpers/dates'

import ChevronLeft from '@geist-ui/icons/chevronLeft'
import ChevronRight from '@geist-ui/icons/chevronRight'
import XCircle from '@geist-ui/icons/xCircle'
import Calendar from '@/icons/calendar'

/*
  TODO
  SelectedDatesISO don't seem to be changing. initialDateRange seems to be rerendering...
  
  On Select change, change value to custom. Tried to do this via ref, didn't work.

  MAYBE TODO
  initialDateRange should be ISO dates, not timestamps.

  Transform selectionDates so that selectionDates[0] is earlier than selectionDates[1].

  dateRangePicker Button could show the text "4 Jan 2022" instead of ISO 8601 (e.g. "2022-01-04").

  dateRangePicker__date text could be formatted as DD/MM/YYYY.

  Don't change the date range shown in dateRangePicker Button and dateRangePicker__date unless both dates
  in the range have been selected, except after clearing the date ranges where dateRangePicker__date
  can be shown as individual dates are selected.

  Add css highlight on range hover. onMouseEnter event could be used to update selectedDates.

  Start from Monday rather than Sunday.

  NOTES:
  The code is using local time (I think), not UTC.

  Can't update date by typing into the date picker. To do so, import createRef from React, change
  dateRangePicker button to input, add onChange=(updateDateFromInput) and ref={inputRef}, and follow
  comments labelled "For editing date in input."

  Used this:
  https://medium.com/swlh/build-a-date-picker-in-15mins-using-javascript-react-from-scratch-f6932c77db09

  Refactored using this:
  https://dev.to/mirmayne/refactoring-build-a-date-picker-in-15mins-using-javascript-react-from-scratch-3a9d

  This might also be useful:
  https://blog.logrocket.com/react-datePicker-217b4aa840da/
*/

const date = new Date()
const oneDay = 60 * 60 * 24 * 1000
const todayTimestamp = date.getTime() - (date.getTime() % oneDay) + (date.getTimezoneOffset() * 1000 * 60)

const initialState = {
  todayTimestamp,
  year: date.getFullYear(),
  month: date.getMonth(),
  selectedDates: [],
  selectedDatesISO: [],
  monthDetails: getMonthDetails(date.getFullYear(), date.getMonth()),
}

const DateRangePicker = ({ initialDateRange, onChange, selectionDates }) => {
  const theme = useTheme()
  // const inputRef = createRef() // For editing date in input.
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (initialDateRange) {
      dispatch({ type: 'selectedDates', value: initialDateRange })
      dispatch({
        type: 'selectedDatesISO',
        value: initialDateRange.map((timestamp) => getDateStringFromTimestamp(timestamp)),
      })
    }
  }, [])

  const getMonthStr = (month) => monthMap[Math.max(Math.min(11, month), 0)] || 'Month'
  const isCurrentDate = (timestamp) => timestamp === todayTimestamp
  const isAfterCurrentDate = (timestamp) => timestamp > todayTimestamp
  const isASelectedDate = (timestamp) =>  state.selectedDates.includes(timestamp)
  const isCurrentMonth = (monthDetails) => monthDetails.filter((el) => el.date === 1 && el.month === 1)[0].timestamp > todayTimestamp

  const isFirstInRange = (timestamp) => {
    let isFirstInRange = false

    if (state.selectedDates[1] && state.selectedDates[0] === timestamp) {
      isFirstInRange = true
    }

    return isFirstInRange
  }

  const isLastInRange = (timestamp) => {
    let isLastInRange = false
  
    if (state.selectedDates[1] && state.selectedDates[1] === timestamp) {
      isLastInRange = true
    }
  
    return isLastInRange
  }

  const isInsideRange = (timestamp) => {
    let isInsideRange = false

    if (state.selectedDates.length === 2 && timestamp > state.selectedDates[0] && timestamp < state.selectedDates[1]) {
      isInsideRange = true
    }

    return isInsideRange
  }

  /* For editing date in input.
  const setDateToInput = (timestamp) => {
    const dateString = getDateStringFromTimestamp(timestamp)
    inputRef.current.value = dateString
  }
  */

  const setDateToDateRangePicker = (timestamp) => {
    const dateString = getDateStringFromTimestamp(timestamp)

    if (!state.selectedDatesISO[0]) {
      dispatch({ type: 'selectedDatesISO', value: [dateString] })
    } else if (state.selectedDates[1]) {
      dispatch({ type: 'selectedDatesISO', value: [dateString] })
    } else {
      const earlierTimestamp = (dateString < state.selectedDatesISO[0]) ? dateString : state.selectedDatesISO[0]
      const laterTimestamp = (dateString > state.selectedDatesISO[0]) ? dateString : state.selectedDatesISO[0]
      dispatch({ type: 'selectedDatesISO', value: [earlierTimestamp, laterTimestamp] })
    }
  }

  const onDateClick = (date) => {
    setDateToDateRangePicker(date.timestamp) // Delete for editing date in input.
    // setDateToInput(date.timestamp) // For editing date in input.

    if (!state.selectedDates[0]) {
      dispatch({ type: 'selectedDates', value: [date.timestamp] })
    } else if (state.selectedDates[1]) {
      dispatch({ type: 'selectedDates', value: [date.timestamp] })
    } else {
      const earlierTimestamp = (date.timestamp < state.selectedDates[0]) ? date.timestamp : state.selectedDates[0]
      const laterTimestamp = (date.timestamp > state.selectedDates[0]) ? date.timestamp : state.selectedDates[0]
      dispatch({ type: 'selectedDates', value: [earlierTimestamp, laterTimestamp] })
      onChange([earlierTimestamp, laterTimestamp]) // Pass data to parent.
    }
  }

  const onSelectionChange = (dates) => {
    if (dates !== 'custom') {
      dates = JSON.parse(dates)
      dispatch({ type: 'selectedDatesISO', value: dates.map((date) => getDateStringFromTimestamp(date)) })
      dispatch({ type: 'selectedDates', value: dates })
      onChange(dates) // Pass data to parent.
    }
  }

  const clearSelectedDates = () => {
    dispatch({ type: 'selectedDatesISO', value: [] })
    dispatch({ type: 'selectedDates', value: [] })
    // onChange(null) // Uncomment to pass data to parent on clear?
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
    <div className="dateRangePicker__container">
      <Description
        title="Date Range"
        content={
          <div className="dateRangePicker__datesContainer">
            <Text h4 className={'dateRangePicker__dates'}>
              <span className={(state.selectedDatesISO[0] ? '' : ' dateRangePicker__dateNotSelected')}>
                {state.selectedDatesISO[0] || 'Start'} 
              </span>
              <span className="dateRangePicker__dateNotSelected"> - </span>
              <span className={(state.selectedDatesISO[1] ? '' : ' dateRangePicker__dateNotSelected')}>
                {state.selectedDatesISO[1] || 'End'}
              </span>
            </Text>
            <Button
              auto
              className="dateRangePicker__resetButton"
              icon={<XCircle />}
              onClick={() => clearSelectedDates()}
            />
          </div>
        }
      />
      <Divider className="dateRangePicker__fullDivider" />
      <Spacer h={2}/>
      <Grid.Container alignItems="center">
        <Grid xs={16}>
          <Text h2 className="dateRangePicker__currentMonth">{getMonthStr(state.month)} {state.year}</Text>
        </Grid>
        <Grid xs={8} justify="flex-end">
          <Button
            auto
            className="dateRangePicker__arrowButton"
            icon={<ChevronLeft />}
            onClick={() => setMonth(-1)}
          />
          <Spacer w={2}/>
          <Button
            auto
            className="dateRangePicker__resetButton"
            onClick={()=> resetCalendar()}
          >
            <Calendar />
          </Button>
          <Spacer w={2}/>
          <Button
            auto
            className="dateRangePicker__arrowButton"
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
              (isAfterCurrentDate(date.timestamp) ?
              ' calendar__dateWrapperDisabled' :
              ' calendar__dateWrapper') +
              (isFirstInRange(date.timestamp) ? ' calendar__firstInRange' : '') +
              (isLastInRange(date.timestamp) ? ' calendar__lastInRange' : '') +
              (isInsideRange(date.timestamp) ? ' calendar__insideRange' : '')
            }
            key={i}
            value={date.timestamp}
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
                  (isCurrentDate(date.timestamp) ? ' calendar__highlight' : '') +
                  (isASelectedDate(date.timestamp) ? ' calendar__selected' : '')
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

        .dateRangePicker__datesContainer {
          display: flex;
        }

        .dateRangePicker__container :global(.dateRangePicker__dateNotSelected) {
          color: ${theme.palette.accents_3};
        }

        .dateRangePicker__container :global(.dateRangePicker__dates) {
          line-height: 1.5;
          margin-top: calc(${theme.layout.unit} / 2);
          margin-right: auto;
        }

        .dateRangePicker__container :global(.dateRangePicker__fullDivider) {
          margin: 0 ${theme.layout.gapHalfNegative};
          max-width: 200% !important;
        }

        .dateRangePicker__container :global(.dateRangePicker__currentMonth) {
          display: block; /* TODO is this needed */
          font-size: .75rem;
          font-weight: 500;
          margin: 0;
          text-transform: uppercase;
          max-width: 100%; /* TODO is this needed */
        }

        .dateRangePicker__container :global(.dateRangePicker__arrowButton) {
          border: 0;
          border-radius: 50%;
          height: auto;
          line-height: 0;
          margin: auto;
          padding: 2px;
        }

        .dateRangePicker__container :global(.dateRangePicker__arrowButton[disabled]) {
          background-color: ${theme.palette.background};
          --geist-ui-button-color: ${theme.palette.accents_3};
        }

        .dateRangePicker__container :global(.dateRangePicker__resetButton) {
          color: ${theme.palette.accents_5};
          border: 0;
          border-radius: 0;
          height: auto;
          line-height: 0;
          padding: 4px;
        }

        .dateRangePicker__container :global(.dateRangePicker__resetButton:hover ) {
          color: ${theme.palette.foreground};
        }

        .dateRangePicker__container :global(.dateRangePicker__resetWrapper) {
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

        .calendar__firstInRange {
          background: linear-gradient(90deg, ${theme.palette.background} 50%, ${theme.palette.accents_2} 50%);
        }

        .calendar__lastInRange {
          background: linear-gradient(90deg, ${theme.palette.accents_2} 50%, ${theme.palette.background} 50%);
        }

        .calendar__insideRange {
          background: ${theme.palette.accents_2};
        }

        .dateRangePicker__container :global(.calendar__date) {
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

        .dateRangePicker__container :global(.calendar__date:hover:not(.calendar__disabled)) {
          border-color: ${theme.palette.success};
        }

        .dateRangePicker__container :global(.calendar__date:focus) {
          box-shadow: 0 0 0 1px ${theme.palette.background},
            0 0 0 3px ${theme.palette.success};
        }

        .dateRangePicker__container :global(.calendar__outsideMonth),
        .dateRangePicker__container :global(.calendar__disabled) {
          color: ${theme.palette.accents_3};
        }

        .dateRangePicker__container :global(.calendar__disabled) {
          pointer-events: none;
        }

        .dateRangePicker__container :global(.calendar__highlight) {
          background: ${theme.palette.error};
          color: #fff;
        }

        .dateRangePicker__container :global(.calendar__selected) {
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
    <div className="dateRangePicker">
      {selectionDates &&
        <Select
          className="dateRangePicker__select"
          placeholder="Custom"
          onChange={onSelectionChange}
        >
          {Object.keys(selectionDates).map((key, i) => (
            <Select.Option key={i} value={JSON.stringify(selectionDates[key])}>{key}</Select.Option>
          ))}
          <Select.Option value="custom">Custom</Select.Option>
        </Select>
      }
      <Popover content={popover}>
        <Button
          className="dateRangePicker__popoverButton"
          icon={<Calendar />}
        >
          {
            (state.selectedDatesISO.length === 2) ?
            `${state.selectedDatesISO[0]} - ${state.selectedDatesISO[1]}` :
            'Select Date Range'
          }
        </Button>
      </Popover>
      <style jsx>{`
        .dateRangePicker {
          display: flex;
          align-items: center;
        }

        .dateRangePicker :global(.dateRangePicker__select) {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        .dateRangePicker :global(.dateRangePicker__select:hover),
        .dateRangePicker :global(.dateRangePicker__select:focus-within) {
          z-index: 1;
        }

        .dateRangePicker :global(.dateRangePicker__select .value) {
          color: ${theme.palette.accents_5};
          font-size: calc(0.875 * ${theme.layout.unit});
        }

        .dateRangePicker :global(.dateRangePicker__select .option) {
          font-size: calc(0.875 * ${theme.layout.unit});
        }

        .dateRangePicker :global(.dateRangePicker__popoverButton) {
          ${
            selectionDates ?
            'border-top-left-radius: 0;border-bottom-left-radius: 0;transform: translateX(-1px);' :
            ''
          }
          height: calc(2.25 * ${theme.layout.unit});
          min-width: calc(15 * ${theme.layout.unit});
          text-align: left;
        }

        .dateRangePicker :global(.dateRangePicker__popoverButton:hover) {
          transform: translateX(-1px);
        }

        .dateRangePicker :global(.dateRangePicker__popoverButton .text) {
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

export default DateRangePicker
