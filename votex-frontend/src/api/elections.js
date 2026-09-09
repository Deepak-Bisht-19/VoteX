import client from './client'
import { ENDPOINTS } from './endpoints'

export async function fetchElections() {
  const { data } = await client.get(ENDPOINTS.elections)
  return data // array of elections
}

export async function fetchElection(id) {
  const { data } = await client.get(ENDPOINTS.election(id))
  return data // single election
}

// payload: { title, position, electionLevel: 'national'|'state'|'district',
//            location: { state, district }, description, startDate, endDate }
export async function createElection(payload) {
  const { data } = await client.post(ENDPOINTS.createElection, payload)
  return data
}

export async function fetchCandidatesForElection(electionId) {
  const { data } = await client.get(ENDPOINTS.candidatesByElection(electionId))
  return data // array of candidates
}

export async function completeElection(electionId) {
  const { data } = await client.put(ENDPOINTS.completeElection(electionId))
  return data // { message, winner, votes }
}

export async function fetchElectionHistory() {
  const { data } = await client.get(ENDPOINTS.electionHistory)
  return data // array of completed elections with winner info
}
