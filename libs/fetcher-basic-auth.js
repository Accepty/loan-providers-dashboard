const fetcherBasicAuth = async (url, username, password) => {
  const buff = Buffer.from(`${username}:${password}`).toString('base64')
  const basicAuth = `Basic ${buff}`

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuth,
    },
  })

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    error.info = await res.json()
    error.status = res.status
    throw error
  }

  return res.json()
}

/*
const fetcherBasicAuth = (url, username, password) => {
  const buff = Buffer.from(`${username}:${password}`).toString('base64')
  const basicAuth = `Basic ${buff}`

  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuth,
    },
  }).then((res) => res.json())
}
*/

export default fetcherBasicAuth