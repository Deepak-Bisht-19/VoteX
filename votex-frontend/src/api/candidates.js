import client from './client'
import { ENDPOINTS } from './endpoints'

// payload should be a FormData instance: name, party, age, election (id),
// and a file under the field name "logo" — matches upload.single("logo").
export async function createCandidate(formData) {
  const { data } = await client.post(ENDPOINTS.createCandidate, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function updateCandidate(id, payload) {
  const { data } = await client.put(ENDPOINTS.updateCandidate(id), payload)
  return data
}

export async function deleteCandidate(id) {
  const { data } = await client.delete(ENDPOINTS.deleteCandidate(id))
  return data
}

export async function castVote(candidateId) {
  const { data } = await client.post(ENDPOINTS.vote(candidateId))
  return data // { message: 'vote cast successfully', votedFor }
}

// Global across all elections — see note in endpoints.js
export async function fetchGlobalResults() {
  const { data } = await client.get(ENDPOINTS.globalResults)
  return data
}

export async function fetchGlobalWinner() {
  const { data } = await client.get(ENDPOINTS.globalWinner)
  return data
}
