import api from './api'

export const redirectUrl = async (shortUrl) => {
  return api.get(`/${shortUrl}`)
}
