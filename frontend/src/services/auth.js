import axios from 'axios'

const BASE_URL = 'http://localhost:4000'
const TOKEN_KEY = 'snapurl_token'
const REFRESH_KEY = 'snapurl_refresh'
const USER_KEY = 'snapurl_user'

const saveAuth = ({ token, refreshToken, user }) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY)
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || {}
  } catch {
    return {}
  }
}

export const isAuthenticated = () => Boolean(getToken())

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

export const login = async (email, password) => {
  const response = await axios.post(`${BASE_URL}/api/urlShot/login`, {
    email,
    password,
  })

  const { token, refreshToken, user } = response.data
  saveAuth({ token, refreshToken, user: { ...user, email } })
  return response.data
}

export const getStoredUserId = () => {
  const user = getUser()
  return user?._id || null
}

export const signUp = async (name, email, password) => {
  const response = await axios.post(`${BASE_URL}/api/urlShot/siginup`, {
    name,
    email,
    password,
  })
  return response.data
}

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    const response = await axios.post(`${BASE_URL}/api/urlShot/refresh`, {
      refreshToken,
    })

    if (response.data?.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token)
      return response.data.token
    }
    return null
  } catch {
    logout()
    return null
  }
}
