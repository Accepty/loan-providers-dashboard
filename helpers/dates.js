const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const getNumberOfDays = (year, month) => 40 - new Date(year, month, 40).getDate()

const getDayDetails = (args) => {
  const date = args.index - args.firstDay
  const day = args.index % 7
  let prevMonth = args.month - 1
  let prevYear = args.year

  if (prevMonth < 0) {
    prevMonth = 11
    prevYear--
  }
  
  let month = (date < 0) ? -1 : (date >= args.numberOfDays) ? 1 : 0
  let prevMonthNumberOfDays = getNumberOfDays(prevYear, prevMonth)
  let _date = ((date < 0) ? prevMonthNumberOfDays + date : date % args.numberOfDays) + 1
  let _month = args.month // args.month will always be the current month.
  let _year = args.year // args.year will always be the current year.

  if (date < 0) {
    _month = _month - 1
    if (_month < 0) {
      _month = 11
      _year = _year - 1
    }
  } else if (date >= args.numberOfDays) {
    _month = _month + 1
    if (_month > 11) {
      _month = 0
      _year = _year + 1
    }
  }

  let timestamp = new Date(_year, _month, _date).getTime() // Changed args.month & args.year to _month & _year.

  return {
    date: _date,
    day,
    month, 
    timestamp,
    dayString: daysMap[day],
  }
}

export const getDateStringFromTimestamp = (timestamp) => {
  const dateObject = new Date(timestamp)
  const month = dateObject.getMonth() + 1
  const date = dateObject.getDate()

  return dateObject.getFullYear() + '-' + (month < 10 ? '0'+month : month) + '-' + (date < 10 ? '0'+date : date)
}

export const getMonthDetails = (year, month) => {
  const firstDay = (new Date(year, month)).getDay()
  const numberOfDays = getNumberOfDays(year, month)
  const monthArray = []
  const rows = 6
  const cols = 7
  let index = 0

  for (let row=0; row < rows; row++) {
    for (let col=0; col < cols; col++) { 
      const currentDay = getDayDetails({
        index,
        numberOfDays,
        firstDay,
        year,
        month,
      })

      monthArray.push(currentDay)
      index++
    }
  }

  return monthArray
}

export const monthMap = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/*
TODO delete

const isCurrentDay = (day) => day.timestamp === todayTimestamp

const isSelectedDay = (day) => day.timestamp === state.selectedDay

const getDateFromDateString = (dateValue) => {
  const dateData = dateValue.split('-').map((d) => parseInt(d, 10))

  if (dateData.length < 3) {
    return null
  }

  const year = dateData[0]
  const month = dateData[1]
  const date = dateData[2]

  return { year, month, date, }
}

// TODO move to DateRangePicker
const setDate = (dateData) => {
  const selectedDay = new Date(dateData.year, dateData.month-1, dateData.date).getTime()
  setSelectedDay(selectedDay)

  if(props.onChange) {
      props.onChange(selectedDay)
  }
}

// TODO move to DateRangePicker
const updateDateFromInput = () => {
  let dateValue = inputRef.current.value
  let dateData = getDateFromDateString(dateValue)
  if(dateData !== null) { 
      setDate(dateData)
      setYear(dateData.year)
      setMonth(dateData.month - 1)
      setMonthDetails(getMonthDetails(dateData.year, dateData.month - 1))
  }
}

const setDateToInput = (timestamp) => {
  let dateString = getDateStringFromTimestamp(timestamp)
  inputRef.current.value = dateString
}

const onDateClick = (day) => {
  setState({selectedDay: day.timestamp}, ()=>setDateToInput(day.timestamp))
  if(props.onChange) {
      props.onChange(day.timestamp)
  }
}

const setYear = (offset) => {
  let year = state.year + offset
  let month = state.month
  setState({ 
      year,
      monthDetails: getMonthDetails(year, month)
  })
}

setMonth = (offset) => {
  let year = state.year
  let month = state.month + offset
  if(month === -1) {
      month = 11
      year--
  } else if(month === 12) {
      month = 0
      year++
  }
  setState({ 
      year, 
      month,
      monthDetails: getMonthDetails(year, month)
  })
}
*/