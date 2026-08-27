const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  health: () => request('/health'),

  facilities: () => request('/facilities'),
  facility: (id) => request(`/facilities/${id}`),
  facilityAvailability: (id) => request(`/facilities/${id}/availability`),
  searchAvailability: (params) => request(`/facilities/search/availability?${new URLSearchParams(params)}`),

  patients: () => request('/patients'),
  patient: (id) => request(`/patients/${id}`),
  createPatient: (data) => request('/patients', { method: 'POST', body: JSON.stringify(data) }),
  patientJourney: (id) => request(`/patients/${id}/journey`),

  runTriage: (data) => request('/triage', { method: 'POST', body: JSON.stringify(data) }),

  appointmentAvailability: (facilityId) => request(`/appointments/availability/${facilityId}`),
  bookAppointment: (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  appointmentsForPatient: (patientId) => request(`/appointments/patient/${patientId}`),
  updateAppointmentStatus: (id, status) => request(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  referrals: (params = {}) => request(`/referrals?${new URLSearchParams(params)}`),
  createReferral: (data) => request('/referrals', { method: 'POST', body: JSON.stringify(data) }),
  referral: (id) => request(`/referrals/${id}`),
  updateReferralStatus: (id, payload) => request(`/referrals/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),

  followups: (params = {}) => request(`/followups?${new URLSearchParams(params)}`),
  createFollowup: (data) => request('/followups', { method: 'POST', body: JSON.stringify(data) }),
  updateFollowupStatus: (id, status) => request(`/followups/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  facilityDashboard: (id) => request(`/dashboard/facility/${id}`),
  districtOverview: () => request('/dashboard/district-overview'),
};
