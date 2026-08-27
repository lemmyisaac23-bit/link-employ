import { isSupabaseConfigured, supabase } from './supabaseClient'
import {
  addApplication as addApplicationLocal,
  addJobType as addJobTypeLocal,
  addSupportTicket as addSupportTicketLocal,
  addTestimonial as addTestimonialLocal,
  getAcceptedTestimonials as getAcceptedTestimonialsLocal,
  getApplications as getApplicationsLocal,
  getApplicationsForEmail as getApplicationsForEmailLocal,
  getJobTypes as getJobTypesLocal,
  getSupportTickets as getSupportTicketsLocal,
  getSupportTicketsForEmail as getSupportTicketsForEmailLocal,
  getTestimonials as getTestimonialsLocal,
  removeJobType as removeJobTypeLocal,
  setJobTypeStatus as setJobTypeStatusLocal,
  updateApplicationStatus as updateApplicationStatusLocal,
  updateJobType as updateJobTypeLocal,
  replyToSupportTicket as replyToSupportTicketLocal,
  updateSupportTicketStatus as updateSupportTicketStatusLocal,
  updateTestimonialStatus as updateTestimonialStatusLocal,
  type ApplicationStatus,
  type JobApplication,
  type JobType,
  type SupportTicket,
  type SupportTicketStatus,
  type Testimonial,
  type TestimonialStatus,
} from './store'

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

function defaultDeadline() {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().slice(0, 10)
}

function defaultJobDescription(title: string, location?: string) {
  const place = location?.trim() || 'the United States'
  return `${title} role available across ${place}. Join a WorklinksUs partner team, contribute your skills from day one, and help connect people with meaningful work.`
}

function daysAgoLabel(isoDate: string) {
  const submitted = new Date(`${isoDate}T12:00:00`)
  const today = new Date()
  const diff = Math.max(
    0,
    Math.floor((today.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24)),
  )
  if (diff === 0) return 'Today'
  if (diff === 1) return '1 day ago'
  if (diff < 7) return `${diff} days ago`
  if (diff < 14) return '1 week ago'
  return `${Math.floor(diff / 7)} weeks ago`
}

type JobRow = {
  id: string
  title: string
  location: string
  employer: string
  pay_per_hour: string
  deadline: string
  description: string
  status: 'open' | 'ended'
  updated_at: string
}

type AppRow = {
  id: string
  name: string
  email: string
  role: string
  location: string
  status: ApplicationStatus
  applied_at: string
}

type TestimonialRow = {
  id: string
  name: string
  role: string
  quote: string
  status: TestimonialStatus
  submitted_at: string
}

type TicketRow = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: SupportTicketStatus
  created_at: string
  admin_reply?: string | null
  replied_at?: string | null
}

function mapJob(row: JobRow): JobType {
  const today = todayStamp()
  const pastDeadline = row.deadline < today
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    employer: row.employer,
    payPerHour: row.pay_per_hour,
    deadline: row.deadline,
    description: row.description,
    status: row.status === 'ended' || pastDeadline ? 'ended' : 'open',
    updatedAt: row.updated_at,
  }
}

function mapApp(row: AppRow): JobApplication {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    location: row.location,
    status: row.status,
    appliedAt: row.applied_at,
  }
}

function mapTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    quote: row.quote,
    status: row.status,
    submittedAt: row.submitted_at,
    when: daysAgoLabel(row.submitted_at),
  }
}

function mapTicket(row: TicketRow): SupportTicket {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    adminReply: row.admin_reply?.trim() || undefined,
    repliedAt: row.replied_at || undefined,
  }
}

async function cloudReady() {
  return Boolean(isSupabaseConfigured && supabase)
}

export async function fetchJobTypes(): Promise<JobType[]> {
  if (!(await cloudReady()) || !supabase) return getJobTypesLocal()

  const { data, error } = await supabase
    .from('job_types')
    .select(
      'id, title, location, employer, pay_per_hour, deadline, description, status, updated_at',
    )
    .order('updated_at', { ascending: false })

  if (error || !data) {
    console.warn('Cloud jobs unavailable:', error?.message)
    return getJobTypesLocal()
  }
  return (data as JobRow[]).map(mapJob)
}

export async function fetchOpenJobTypes(): Promise<JobType[]> {
  const jobs = await fetchJobTypes()
  return jobs.filter((job) => job.status === 'open')
}

export async function createJobType(
  title: string,
  location: string,
  deadline: string,
  employer = 'WorklinksUs Partner',
  payPerHour = '$35',
): Promise<JobType[]> {
  if (!(await cloudReady()) || !supabase) {
    return addJobTypeLocal(title, location, deadline, employer, payPerHour)
  }

  const trimmedTitle = title.trim()
  if (!trimmedTitle) return fetchJobTypes()

  const trimmedLocation = location.trim() || 'United States · Remote & on-site'
  const trimmedDeadline = deadline.trim() || defaultDeadline()
  const row = {
    id: `job-${Date.now()}`,
    title: trimmedTitle,
    location: trimmedLocation,
    employer: employer.trim() || 'WorklinksUs Partner',
    pay_per_hour: payPerHour.trim() || '$35',
    deadline: trimmedDeadline,
    description: defaultJobDescription(trimmedTitle, trimmedLocation),
    status: trimmedDeadline < todayStamp() ? 'ended' : 'open',
    updated_at: todayStamp(),
  }

  const { error } = await supabase.from('job_types').insert(row)
  if (error) {
    console.warn('Cloud job create failed:', error.message)
    throw new Error(error.message)
  }
  return fetchJobTypes()
}

export async function patchJobType(
  id: string,
  title: string,
  location: string,
  deadline: string,
  employer = 'WorklinksUs Partner',
  payPerHour = '$35',
): Promise<JobType[]> {
  if (!(await cloudReady()) || !supabase) {
    return updateJobTypeLocal(id, title, location, deadline, employer, payPerHour)
  }

  const trimmedTitle = title.trim()
  if (!trimmedTitle) return fetchJobTypes()

  const trimmedDeadline = deadline.trim() || defaultDeadline()
  const { error } = await supabase
    .from('job_types')
    .update({
      title: trimmedTitle,
      location: location.trim() || 'United States · Remote & on-site',
      employer: employer.trim() || 'WorklinksUs Partner',
      pay_per_hour: payPerHour.trim() || '$35',
      deadline: trimmedDeadline,
      status: trimmedDeadline < todayStamp() ? 'ended' : 'open',
      updated_at: todayStamp(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  return fetchJobTypes()
}

export async function patchJobTypeStatus(
  id: string,
  status: JobType['status'],
): Promise<JobType[]> {
  if (!(await cloudReady()) || !supabase) {
    return setJobTypeStatusLocal(id, status)
  }

  const jobs = await fetchJobTypes()
  const current = jobs.find((job) => job.id === id)
  if (!current) return jobs

  const payload: Record<string, string> = {
    status,
    updated_at: todayStamp(),
  }
  if (status === 'open' && current.deadline < todayStamp()) {
    payload.deadline = defaultDeadline()
  }

  const { error } = await supabase.from('job_types').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  return fetchJobTypes()
}

export async function deleteJobType(id: string): Promise<JobType[]> {
  if (!(await cloudReady()) || !supabase) return removeJobTypeLocal(id)

  const { error } = await supabase.from('job_types').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return fetchJobTypes()
}

export async function fetchApplications(): Promise<JobApplication[]> {
  if (!(await cloudReady()) || !supabase) return getApplicationsLocal()

  const { data, error } = await supabase
    .from('applications')
    .select('id, name, email, role, location, status, applied_at')
    .order('applied_at', { ascending: false })

  if (error || !data) {
    console.warn('Cloud applications unavailable:', error?.message)
    return getApplicationsLocal()
  }
  return (data as AppRow[]).map(mapApp)
}

export async function fetchApplicationsForEmail(
  email: string,
): Promise<JobApplication[]> {
  if (!(await cloudReady()) || !supabase) {
    return getApplicationsForEmailLocal(email)
  }

  const { data, error } = await supabase
    .from('applications')
    .select('id, name, email, role, location, status, applied_at')
    .eq('email', email.trim().toLowerCase())
    .order('applied_at', { ascending: false })

  if (error || !data) {
    console.warn('Cloud applications unavailable:', error?.message)
    return getApplicationsForEmailLocal(email)
  }
  return (data as AppRow[]).map(mapApp)
}

export async function createApplication(input: {
  name: string
  email: string
  role: string
  location: string
}): Promise<JobApplication[]> {
  if (!(await cloudReady()) || !supabase) {
    return addApplicationLocal(input)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const row = {
    id: `app-${Date.now()}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role.trim(),
    location: input.location.trim(),
    status: 'pending' as const,
    applied_at: todayStamp(),
    user_id: user?.id ?? null,
  }

  const { error } = await supabase.from('applications').insert(row)
  if (error) throw new Error(error.message)
  return fetchApplicationsForEmail(row.email)
}

export async function patchApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<JobApplication[]> {
  if (!(await cloudReady()) || !supabase) {
    return updateApplicationStatusLocal(id, status)
  }

  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', id)
  if (error) throw new Error(error.message)
  return fetchApplications()
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  if (!(await cloudReady()) || !supabase) return getTestimonialsLocal()

  const { data, error } = await supabase
    .from('testimonials')
    .select('id, name, role, quote, status, submitted_at')
    .order('submitted_at', { ascending: false })

  if (error || !data) {
    console.warn('Cloud testimonials unavailable:', error?.message)
    return getTestimonialsLocal()
  }
  return (data as TestimonialRow[]).map(mapTestimonial)
}

export async function fetchAcceptedTestimonials(): Promise<Testimonial[]> {
  if (!(await cloudReady()) || !supabase) {
    return getAcceptedTestimonialsLocal()
  }

  const { data, error } = await supabase
    .from('testimonials')
    .select('id, name, role, quote, status, submitted_at')
    .eq('status', 'accepted')
    .order('submitted_at', { ascending: false })

  if (error || !data) {
    console.warn('Cloud testimonials unavailable:', error?.message)
    return getAcceptedTestimonialsLocal()
  }
  return (data as TestimonialRow[]).map(mapTestimonial)
}

export async function createTestimonial(input: {
  name: string
  role: string
  quote: string
}): Promise<Testimonial[]> {
  if (!(await cloudReady()) || !supabase) {
    return addTestimonialLocal(input)
  }

  const name = input.name.trim()
  const quote = input.quote.trim()
  if (!name || !quote) return fetchTestimonials()

  const row = {
    id: `test-${Date.now()}`,
    name,
    role: input.role.trim() || 'WorklinksUs member',
    quote,
    status: 'pending' as const,
    submitted_at: todayStamp(),
  }

  const { error } = await supabase.from('testimonials').insert(row)
  if (error) throw new Error(error.message)
  return fetchTestimonials()
}

export async function patchTestimonialStatus(
  id: string,
  status: TestimonialStatus,
): Promise<Testimonial[]> {
  if (!(await cloudReady()) || !supabase) {
    return updateTestimonialStatusLocal(id, status)
  }

  const { error } = await supabase
    .from('testimonials')
    .update({ status })
    .eq('id', id)
  if (error) throw new Error(error.message)
  return fetchTestimonials()
}

const TICKET_COLUMNS =
  'id, name, email, subject, message, status, created_at, admin_reply, replied_at'

export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  if (!(await cloudReady()) || !supabase) return getSupportTicketsLocal()

  const { data, error } = await supabase
    .from('support_tickets')
    .select(TICKET_COLUMNS)
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.warn('Cloud tickets unavailable:', error?.message)
    return getSupportTicketsLocal()
  }
  return (data as TicketRow[]).map(mapTicket)
}

export async function fetchSupportTicketsForEmail(
  email: string,
): Promise<SupportTicket[]> {
  if (!(await cloudReady()) || !supabase) {
    return getSupportTicketsForEmailLocal(email)
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .select(TICKET_COLUMNS)
    .eq('email', email.trim().toLowerCase())
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.warn('Cloud tickets unavailable:', error?.message)
    return getSupportTicketsForEmailLocal(email)
  }
  return (data as TicketRow[]).map(mapTicket)
}

export async function createSupportTicket(input: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<SupportTicket[]> {
  if (!(await cloudReady()) || !supabase) {
    return addSupportTicketLocal(input)
  }

  const row = {
    id: `ticket-${Date.now()}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: 'open' as const,
    created_at: todayStamp(),
  }

  const { error } = await supabase.from('support_tickets').insert(row)
  if (error) throw new Error(error.message)
  return fetchSupportTicketsForEmail(row.email)
}

export async function patchSupportTicketStatus(
  id: string,
  status: SupportTicketStatus,
): Promise<SupportTicket[]> {
  if (!(await cloudReady()) || !supabase) {
    return updateSupportTicketStatusLocal(id, status)
  }

  const { error } = await supabase
    .from('support_tickets')
    .update({ status })
    .eq('id', id)
  if (error) throw new Error(error.message)
  return fetchSupportTickets()
}

export async function replyToSupportTicket(
  id: string,
  reply: string,
): Promise<SupportTicket[]> {
  const adminReply = reply.trim()
  if (!adminReply) throw new Error('Reply cannot be empty.')

  if (!(await cloudReady()) || !supabase) {
    return replyToSupportTicketLocal(id, adminReply)
  }

  const { error } = await supabase
    .from('support_tickets')
    .update({
      admin_reply: adminReply,
      replied_at: todayStamp(),
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
  return fetchSupportTickets()
}
