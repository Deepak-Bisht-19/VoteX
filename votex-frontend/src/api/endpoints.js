// Matches your actual route files exactly — no /api prefix, since
// server.js mounts routers at app.use("/user", ...), ("/candidate", ...),
// ("/election", ...), ("/admin", ...).

export const ENDPOINTS = {
  // userRoutes.js
  signup: '/user/signup',
  login: '/user/login',
  profile: '/user/profile',
  changePassword: '/user/profile/password',
  reverificationRequest: '/user/reverification-request',

  // adminRoutes.js
  signupAdmin: '/admin/signup-admin',
  reverificationRequests: '/admin/reverification-requests',
  approveReverification: (id) => `/admin/approve-reverification/${id}`,
  permanentBlock: (id) => `/admin/permanent-block/${id}`,
  deactivateUser: (id) => `/admin/deactivate/${id}`,
  reactivateUser: (id) => `/admin/reactivate/${id}`,

  // electionRoutes.js
  createElection: '/election/create',
  elections: '/election/',
  election: (id) => `/election/${id}`,
  candidatesByElection: (electionId) => `/election/${electionId}/candidate`,
  completeElection: (electionId) => `/election/complete/${electionId}`,
  electionHistory: '/election/history',

  // candidateRoutes.js
  createCandidate: '/candidate/',
  updateCandidate: (id) => `/candidate/update/${id}`,
  deleteCandidate: (id) => `/candidate/delete/${id}`,
  vote: (candidateId) => `/candidate/vote/${candidateId}`,
  // NOTE: these two are global (not scoped to one election) in your
  // current backend — they sort/return across ALL candidates.
  globalResults: '/candidate/result',
  globalWinner: '/candidate/winner',
}
