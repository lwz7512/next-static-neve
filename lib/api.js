/**
 * GraphQL fetch API
 */
export const USE_ABS_PATH = process.env.USE_ABS_PATH
export const WP_URL  = process.env.WORDPRESS_URL

export async function fetchAPI(query, { variables } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  
  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers[
      'Authorization'
    ] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`
  }
  
  const safeUrl = (WP_URL.slice(-1) == '/') ? WP_URL.slice(0, -1) : WP_URL
  const API_URL = `${safeUrl}/graphql`
  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  const json = await res.json()
  if (json.errors) {
    console.error(json.errors)
    throw new Error('Failed to fetch API')
  }
  return json.data
}
