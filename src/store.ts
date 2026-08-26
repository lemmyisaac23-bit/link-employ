export type RegisteredUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  country?: string
  password?: string
  createdAt: string
}

export type UserProfile = {
  userId: string
  gender: '' | 'male' | 'female'
  age: string
  disability: '' | 'yes' | 'no'
  disabilityDetails: string
  street: string
  building: string
  town: string
  postalAddress: string
  educationLevel: string
  experience: string
  cvFileName: string
  updatedAt: string
}

export type ApplicationStatus = 'pending' | 'accepted' | 'denied'

export type JobApplication = {
  id: string
  name: string
  email: string
  role: string
  location: string
  status: ApplicationStatus
  appliedAt: string
}

export type JobType = {
  id: string
  title: string
  location: string
  employer: string
  payPerHour: string
  deadline: string
  description: string
  status: 'open' | 'ended'
  updatedAt: string
}

export type TestimonialStatus = 'pending' | 'accepted' | 'denied'

export type Testimonial = {
  id: string
  name: string
  role: string
  quote: string
  when: string
  status: TestimonialStatus
  submittedAt: string
}

export type SupportTicketStatus = 'open' | 'resolved' | 'closed'

export type SupportTicket = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: SupportTicketStatus
  createdAt: string
}

const USERS_KEY = 'worklinkus_users'
const PROFILES_KEY = 'worklinkus_profiles'
const APPLICATIONS_KEY = 'worklinkus_applications'
const JOBS_KEY = 'worklinkus_job_types'
const TESTIMONIALS_KEY = 'worklinkus_testimonials'
const TICKETS_KEY = 'worklinkus_support_tickets'

const LEGACY_USERS_KEY = 'employlink_users'
const LEGACY_PROFILES_KEY = 'employlink_profiles'
const LEGACY_APPLICATIONS_KEY = 'employlink_applications'
const LEGACY_JOBS_KEY = 'employlink_job_types'
const LEGACY_TESTIMONIALS_KEY = 'employlink_testimonials'
const LEGACY_TICKETS_KEY = 'employlink_support_tickets'

let didMigrateStorage = false

function migrateLegacyStorage() {
  if (didMigrateStorage || typeof localStorage === 'undefined') return
  didMigrateStorage = true

  const pairs: Array<[string, string]> = [
    [LEGACY_USERS_KEY, USERS_KEY],
    [LEGACY_PROFILES_KEY, PROFILES_KEY],
    [LEGACY_APPLICATIONS_KEY, APPLICATIONS_KEY],
    [LEGACY_JOBS_KEY, JOBS_KEY],
    [LEGACY_TESTIMONIALS_KEY, TESTIMONIALS_KEY],
    [LEGACY_TICKETS_KEY, TICKETS_KEY],
  ]

  for (const [legacyKey, nextKey] of pairs) {
    const legacyRaw = localStorage.getItem(legacyKey)
    if (!legacyRaw) continue

    const currentRaw = localStorage.getItem(nextKey)
    if (!currentRaw) {
      localStorage.setItem(nextKey, legacyRaw)
    } else if (nextKey === USERS_KEY) {
      try {
        const legacyUsers = JSON.parse(legacyRaw) as RegisteredUser[]
        const currentUsers = JSON.parse(currentRaw) as RegisteredUser[]
        const byEmail = new Map<string, RegisteredUser>()
        for (const user of [...legacyUsers, ...currentUsers]) {
          const email = user.email.trim().toLowerCase()
          const prev = byEmail.get(email)
          if (!prev) {
            byEmail.set(email, { ...user, email })
            continue
          }
          byEmail.set(email, {
            ...prev,
            ...user,
            email,
            password: user.password || prev.password,
          })
        }
        localStorage.setItem(nextKey, JSON.stringify([...byEmail.values()]))
      } catch {
        // Keep current key if merge fails.
      }
    }
    localStorage.removeItem(legacyKey)
  }
}

const seedTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Jordan Ellis',
    role: 'Product Designer · Austin, TX',
    quote:
      'I applied to three roles in one evening and had a clear status update within days. WorklinksUs felt focused, not noisy.',
    when: '2 days ago',
    status: 'accepted',
    submittedAt: '2026-08-13',
  },
  {
    id: 'test-2',
    name: 'Sam Rivera',
    role: 'Software Engineer · Remote',
    quote:
      'The matches actually fit my stack. I stopped scrolling endless boards and started interviewing with intent.',
    when: '3 days ago',
    status: 'accepted',
    submittedAt: '2026-08-12',
  },
  {
    id: 'test-3',
    name: 'Priya Nair',
    role: 'Operations Manager · Chicago, IL',
    quote:
      'WorklinksUs connected me with a hiring team that valued operations experience. The path from apply to offer was simple.',
    when: '4 days ago',
    status: 'accepted',
    submittedAt: '2026-08-11',
  },
  {
    id: 'test-4',
    name: 'Marcus Cole',
    role: 'Data Analyst · Atlanta, GA',
    quote:
      'I liked seeing deadlines and status in one place. It kept me organized while I compared offers.',
    when: '5 days ago',
    status: 'accepted',
    submittedAt: '2026-08-10',
  },
]

const seedApplications: JobApplication[] = [
  {
    id: 'app-1',
    name: 'Jordan Lee',
    email: 'jordan.lee@email.com',
    role: 'Product Designer',
    location: 'Austin, TX',
    status: 'pending',
    appliedAt: '2026-08-12',
  },
  {
    id: 'app-2',
    name: 'Sam Rivera',
    email: 'sam.rivera@email.com',
    role: 'Software Engineer',
    location: 'Remote',
    status: 'pending',
    appliedAt: '2026-08-13',
  },
  {
    id: 'app-3',
    name: 'Casey Nguyen',
    email: 'casey.nguyen@email.com',
    role: 'Operations Manager',
    location: 'Chicago, IL',
    status: 'pending',
    appliedAt: '2026-08-14',
  },
]

const seedJobs: JobType[] = [
  {
    id: 'job-1',
    title: 'Product Designer',
    location: 'United States · Remote & on-site',
    employer: 'WorklinksUs Partners',
    payPerHour: '$42',
    deadline: '2026-09-15',
    description:
      'Design clear product experiences for US job seekers and hiring teams. You will map user flows, craft interface systems, and partner with engineering to ship polished features that help people find work faster.',
    status: 'open',
    updatedAt: '2026-08-10',
  },
  {
    id: 'job-2',
    title: 'Software Engineer',
    location: 'United States · Remote & on-site',
    employer: 'WorklinksUs Tech',
    payPerHour: '$55',
    deadline: '2026-09-30',
    description:
      'Build and improve WorklinksUs matching tools. You will write reliable front-end and API features, collaborate on product decisions, and help keep applications fast, secure, and easy to use nationwide.',
    status: 'open',
    updatedAt: '2026-08-10',
  },
  {
    id: 'job-3',
    title: 'Operations Manager',
    location: 'United States · Remote & on-site',
    employer: 'WorklinksUs Operations',
    payPerHour: '$38',
    deadline: '2026-08-20',
    description:
      'Own day-to-day hiring operations across open roles. You will coordinate candidate pipelines, keep deadlines on track, and support employers so every application moves with clarity and care.',
    status: 'open',
    updatedAt: '2026-08-10',
  },
  {
    id: 'job-4',
    title: 'Data Analyst',
    location: 'United States · Remote & on-site',
    employer: 'WorklinksUs Insights',
    payPerHour: '$40',
    deadline: '2026-10-01',
    description:
      'Turn hiring and application data into useful insights. You will track match quality, report on open roles, and help the team improve how candidates and employers connect across the US.',
    status: 'open',
    updatedAt: '2026-08-10',
  },
  {
    id: 'job-5',
    title: 'Customer Success',
    location: 'United States · Remote & on-site',
    employer: 'WorklinksUs Support',
    payPerHour: '$32',
    deadline: '2026-09-05',
    description:
      'Guide candidates and employers through WorklinksUs. You will answer questions, resolve account issues, and make sure people feel supported from signup through application decisions.',
    status: 'open',
    updatedAt: '2026-08-10',
  },
  {
    id: 'job-6',
    title: 'Marketing Lead',
    location: 'United States · Remote & on-site',
    employer: 'WorklinksUs Growth',
    payPerHour: '$45',
    deadline: '2026-08-01',
    description:
      'Lead campaigns that grow WorklinksUs awareness. You will shape messaging for job seekers and employers, launch outreach across channels, and measure what brings the best matches.',
    status: 'ended',
    updatedAt: '2026-08-10',
  },
]

function readJson<T>(key: string, fallback: T): T {
  migrateLegacyStorage()
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  migrateLegacyStorage()
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new Error(
      'Could not save data in this browser. Check storage permissions and try again.',
    )
  }
}

export function getUsers(): RegisteredUser[] {
  return readJson<RegisteredUser[]>(USERS_KEY, [])
}

export function findUserByEmail(email: string): RegisteredUser | null {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return null
  return (
    getUsers().find((entry) => entry.email.trim().toLowerCase() === normalized) ||
    null
  )
}

function getProfiles(): UserProfile[] {
  return readJson<UserProfile[]>(PROFILES_KEY, [])
}

export function getUserProfile(userId: string): UserProfile {
  const existing = getProfiles().find((profile) => profile.userId === userId)
  if (existing) return existing

  return {
    userId,
    gender: '',
    age: '',
    disability: '',
    disabilityDetails: '',
    street: '',
    building: '',
    town: '',
    postalAddress: '',
    educationLevel: '',
    experience: '',
    cvFileName: '',
    updatedAt: '',
  }
}

export function saveUserProfile(
  profile: Omit<UserProfile, 'updatedAt'>,
): UserProfile {
  const profiles = getProfiles()
  const next: UserProfile = {
    ...profile,
    updatedAt: todayStamp(),
  }
  const index = profiles.findIndex((item) => item.userId === profile.userId)
  const updated =
    index >= 0
      ? profiles.map((item, i) => (i === index ? next : item))
      : [next, ...profiles]
  writeJson(PROFILES_KEY, updated)
  return next
}

export function addUser(
  user: Omit<RegisteredUser, 'id' | 'createdAt'>,
): RegisteredUser {
  const email = user.email.trim().toLowerCase()
  const password = (user.password ?? '').trim()
  if (!email) {
    throw new Error('Please enter your email address.')
  }
  if (!password) {
    throw new Error('Password is required.')
  }

  const users = getUsers()
  const existingIndex = users.findIndex(
    (entry) => entry.email.trim().toLowerCase() === email,
  )

  if (existingIndex >= 0) {
    const existing = users[existingIndex]
    if (existing.password && existing.password !== password) {
      throw new Error(
        'An account with this email already exists. Sign in instead.',
      )
    }

    const updated: RegisteredUser = {
      ...existing,
      firstName: user.firstName.trim(),
      lastName: user.lastName.trim(),
      email,
      phone: user.phone?.trim() || existing.phone,
      country: user.country?.trim() || existing.country,
      password,
    }
    const nextUsers = users.map((entry, index) =>
      index === existingIndex ? updated : entry,
    )
    writeJson(USERS_KEY, nextUsers)
    return updated
  }

  const next: RegisteredUser = {
    firstName: user.firstName.trim(),
    lastName: user.lastName.trim(),
    email,
    phone: user.phone?.trim() || undefined,
    country: user.country?.trim() || undefined,
    password,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  writeJson(USERS_KEY, [next, ...users])
  return next
}

export type CredentialCheck =
  | { ok: true; user: RegisteredUser }
  | { ok: false; reason: 'not_found' | 'bad_password' }

export function checkUserCredentials(
  email: string,
  password: string,
): CredentialCheck {
  const user = findUserByEmail(email)
  if (!user) {
    return { ok: false, reason: 'not_found' }
  }
  const normalizedPassword = password.trim()
  if (!user.password || user.password !== normalizedPassword) {
    return { ok: false, reason: 'bad_password' }
  }
  return { ok: true, user }
}

export function findUserByCredentials(
  email: string,
  password: string,
): RegisteredUser | null {
  const result = checkUserCredentials(email, password)
  return result.ok ? result.user : null
}

export function addApplication(
  application: Omit<JobApplication, 'id' | 'status' | 'appliedAt'>,
): JobApplication[] {
  const applications = getApplications()
  const alreadyApplied = applications.some(
    (app) =>
      app.email.toLowerCase() === application.email.toLowerCase() &&
      app.role.toLowerCase() === application.role.toLowerCase() &&
      app.status === 'pending',
  )
  if (alreadyApplied) {
    return applications
  }

  const next: JobApplication = {
    ...application,
    id: `app-${Date.now()}`,
    status: 'pending',
    appliedAt: todayStamp(),
  }
  const updated = [next, ...applications]
  writeJson(APPLICATIONS_KEY, updated)
  return updated
}

export function getApplicationsForEmail(email: string): JobApplication[] {
  return getApplications().filter(
    (app) => app.email.toLowerCase() === email.trim().toLowerCase(),
  )
}

export function getOpenJobTypes(): JobType[] {
  return getJobTypes().filter((job) => job.status === 'open')
}

export function getApplications(): JobApplication[] {
  const existing = localStorage.getItem(APPLICATIONS_KEY)
  if (!existing) {
    writeJson(APPLICATIONS_KEY, seedApplications)
    return seedApplications
  }
  return readJson<JobApplication[]>(APPLICATIONS_KEY, seedApplications)
}

export function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): JobApplication[] {
  const applications = getApplications().map((app) =>
    app.id === id ? { ...app, status } : app,
  )
  writeJson(APPLICATIONS_KEY, applications)
  return applications
}

export function getJobTypes(): JobType[] {
  const existing = localStorage.getItem(JOBS_KEY)
  if (!existing) {
    writeJson(JOBS_KEY, seedJobs)
    return seedJobs
  }

  const raw = readJson<Partial<JobType>[]>(JOBS_KEY, seedJobs)
  const today = todayStamp()
  const normalized: JobType[] = raw.map((job, index) => {
    const deadline = job.deadline || defaultDeadline()
    const explicitEnded = job.status === 'ended'
    const pastDeadline = deadline < today

    return {
      id: job.id || `job-${index + 1}`,
      title: job.title || 'Untitled role',
      location: job.location || 'United States · Remote & on-site',
      employer: job.employer || 'WorklinksUs Partner',
      payPerHour: job.payPerHour || '$35',
      deadline,
      description:
        job.description ||
        defaultJobDescription(job.title || 'Untitled role', job.location),
      status: explicitEnded || pastDeadline ? 'ended' : 'open',
      updatedAt: job.updatedAt || today,
    }
  })

  writeJson(JOBS_KEY, normalized)
  return normalized
}

export function addJobType(
  title: string,
  location: string,
  deadline: string,
  employer = 'WorklinksUs Partner',
  payPerHour = '$35',
): JobType[] {
  const trimmedTitle = title.trim()
  const trimmedLocation = location.trim() || 'United States · Remote & on-site'
  const trimmedDeadline = deadline.trim() || defaultDeadline()
  const trimmedEmployer = employer.trim() || 'WorklinksUs Partner'
  const trimmedPay = payPerHour.trim() || '$35'
  if (!trimmedTitle) return getJobTypes()

  const jobs = getJobTypes()
  const next: JobType = {
    id: `job-${Date.now()}`,
    title: trimmedTitle,
    location: trimmedLocation,
    employer: trimmedEmployer,
    payPerHour: trimmedPay,
    deadline: trimmedDeadline,
    description: defaultJobDescription(trimmedTitle, trimmedLocation),
    status: trimmedDeadline < todayStamp() ? 'ended' : 'open',
    updatedAt: todayStamp(),
  }
  const updated = [next, ...jobs]
  writeJson(JOBS_KEY, updated)
  return updated
}

export function updateJobType(
  id: string,
  title: string,
  location: string,
  deadline: string,
  employer = 'WorklinksUs Partner',
  payPerHour = '$35',
): JobType[] {
  const trimmedTitle = title.trim()
  const trimmedLocation = location.trim() || 'United States · Remote & on-site'
  const trimmedDeadline = deadline.trim() || defaultDeadline()
  const trimmedEmployer = employer.trim() || 'WorklinksUs Partner'
  const trimmedPay = payPerHour.trim() || '$35'
  if (!trimmedTitle) return getJobTypes()

  const updated = getJobTypes().map((job) =>
    job.id === id
      ? {
          ...job,
          title: trimmedTitle,
          location: trimmedLocation,
          employer: trimmedEmployer,
          payPerHour: trimmedPay,
          deadline: trimmedDeadline,
          status: (trimmedDeadline < todayStamp()
            ? 'ended'
            : 'open') as JobType['status'],
          updatedAt: todayStamp(),
        }
      : job,
  )
  writeJson(JOBS_KEY, updated)
  return updated
}

export function setJobTypeStatus(
  id: string,
  status: JobType['status'],
): JobType[] {
  const updated = getJobTypes().map((job) => {
    if (job.id !== id) return job

    if (status === 'open' && job.deadline < todayStamp()) {
      return {
        ...job,
        status: 'open' as const,
        deadline: defaultDeadline(),
        updatedAt: todayStamp(),
      }
    }

    return {
      ...job,
      status,
      updatedAt: todayStamp(),
    }
  })
  writeJson(JOBS_KEY, updated)
  return updated
}

export function removeJobType(id: string): JobType[] {
  const updated = getJobTypes().filter((job) => job.id !== id)
  writeJson(JOBS_KEY, updated)
  return updated
}

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
  return `${title} role available across ${place}. Join a WorklinksUs partner team, contribute your skills from day one, and help connect people with meaningful work. Review responsibilities with the hiring team after you apply.`
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

export function getTestimonials(): Testimonial[] {
  const existing = localStorage.getItem(TESTIMONIALS_KEY)
  if (!existing) {
    writeJson(TESTIMONIALS_KEY, seedTestimonials)
    return seedTestimonials
  }
  return readJson<Testimonial[]>(TESTIMONIALS_KEY, seedTestimonials)
}

export function getAcceptedTestimonials(): Testimonial[] {
  return getTestimonials()
    .filter((item) => item.status === 'accepted')
    .map((item) => ({
      ...item,
      when: daysAgoLabel(item.submittedAt),
    }))
}

export function getPendingTestimonials(): Testimonial[] {
  return getTestimonials().filter((item) => item.status === 'pending')
}

export function addTestimonial(input: {
  name: string
  role: string
  quote: string
}): Testimonial[] {
  const name = input.name.trim()
  const role = input.role.trim() || 'WorklinksUs member'
  const quote = input.quote.trim()
  if (!name || !quote) return getTestimonials()

  const submittedAt = todayStamp()
  const next: Testimonial = {
    id: `test-${Date.now()}`,
    name,
    role,
    quote,
    when: 'Today',
    status: 'pending',
    submittedAt,
  }
  const updated = [next, ...getTestimonials()]
  writeJson(TESTIMONIALS_KEY, updated)
  return updated
}

export function updateTestimonialStatus(
  id: string,
  status: TestimonialStatus,
): Testimonial[] {
  const updated = getTestimonials().map((item) =>
    item.id === id ? { ...item, status } : item,
  )
  writeJson(TESTIMONIALS_KEY, updated)
  return updated
}

export function getSupportTickets(): SupportTicket[] {
  return readJson<SupportTicket[]>(TICKETS_KEY, [])
}

export function getSupportTicketsForEmail(email: string): SupportTicket[] {
  return getSupportTickets().filter(
    (ticket) => ticket.email.toLowerCase() === email.trim().toLowerCase(),
  )
}

export function addSupportTicket(input: {
  name: string
  email: string
  subject: string
  message: string
}): SupportTicket[] {
  const name = input.name.trim()
  const email = input.email.trim()
  const subject = input.subject.trim()
  const message = input.message.trim()
  if (!name || !email || !subject || !message) return getSupportTickets()

  const next: SupportTicket = {
    id: `ticket-${Date.now()}`,
    name,
    email,
    subject,
    message,
    status: 'open',
    createdAt: todayStamp(),
  }
  const updated = [next, ...getSupportTickets()]
  writeJson(TICKETS_KEY, updated)
  return updated
}

export function updateSupportTicketStatus(
  id: string,
  status: SupportTicketStatus,
): SupportTicket[] {
  const updated = getSupportTickets().map((ticket) =>
    ticket.id === id ? { ...ticket, status } : ticket,
  )
  writeJson(TICKETS_KEY, updated)
  return updated
}
