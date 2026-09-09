import client from './client'
import { ENDPOINTS } from './endpoints'

// payload: { name, age, email, mobile, address, location: { state, district }, aadharCardNumber, password }
export async function registerUser(payload) {
  const { data } = await client.post(ENDPOINTS.signup, payload)
  return data // { response: <saved user>, token }
}

// payload: { aadharCardNumber, password }
export async function loginUser(payload) {
  const { data } = await client.post(ENDPOINTS.login, payload)
  return data // { token }
}

export async function fetchProfile() {
  const { data } = await client.get(ENDPOINTS.profile)
  return data // { user }
}

export async function changePassword(payload) {
  const { data } = await client.put(ENDPOINTS.changePassword, payload)
  return data
}

export async function requestReverification() {
  const { data } = await client.put(ENDPOINTS.reverificationRequest)
  return data
}

// Admin account creation — requires the ADMIN_SECRET_KEY from the backend's .env
export async function registerAdmin(payload) {
  const { data } = await client.post(ENDPOINTS.signupAdmin, payload)
  return data
}
