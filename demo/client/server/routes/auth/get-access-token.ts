export default defineEventHandler(async (event) => {
  const { clientSecret, public: { clientId } } = useRuntimeConfig()
  const query = getQuery(event)

  if (!query.code) {
    return null
  }

  const result =  await $fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: query.code,
    })
  })

  return result
})
