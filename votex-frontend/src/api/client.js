import axios from 'axios'

// Points at your VoteX backend. Set VITE_API_URL in a .env file
// (see .env.example) — defaults to the local dev server.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const client = axios.create({ baseURL })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('votex_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('votex_token')
      localStorage.removeItem('votex_user')
    }
    return Promise.reject(err)
  }
)

export default client
