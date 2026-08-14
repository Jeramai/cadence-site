/* Cadence marketing site. No dependencies, no scroll listeners. */

/* SET THIS before launch. The demo form composes a mail to this address. */
const DEMO_EMAIL = 'hello@cadence.example'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ── Theme toggle ──────────────────────────────────────────────────────────── */

const THEME_KEY = 'cadence-theme'
const THEME_COLOR = { light: '#f2f6f5', dark: '#0e1b19' }
const systemDark = window.matchMedia('(prefers-color-scheme: dark)')

const activeTheme = () => {
  const chosen = document.documentElement.dataset.theme
  if (chosen === 'light' || chosen === 'dark') return chosen
  return systemDark.matches ? 'dark' : 'light'
}

const themeButton = document.getElementById('theme-toggle')

const paintTheme = () => {
  const now = activeTheme()
  const next = now === 'dark' ? 'light' : 'dark'
  if (themeButton) themeButton.setAttribute('aria-label', `Switch to ${next} theme`)

  /* The two theme-color tags are media scoped for readers with no JavaScript. Once a
     choice exists they would contradict it, so collapse them to the active colour. */
  const tags = document.querySelectorAll('meta[name="theme-color"]')
  for (const [i, tag] of tags.entries()) {
    if (i === 0) {
      tag.removeAttribute('media')
      tag.setAttribute('content', THEME_COLOR[now])
    } else {
      tag.remove()
    }
  }
}

if (themeButton) {
  themeButton.addEventListener('click', () => {
    const next = activeTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch (e) {
      /* Private mode or blocked storage: the choice still applies for this page. */
    }
    paintTheme()
  })
}

/* Follow the OS while no explicit choice is stored. */
systemDark.addEventListener('change', () => {
  if (!document.documentElement.dataset.theme) paintTheme()
})

paintTheme()

/* ── Scroll reveal ─────────────────────────────────────────────────────────── */

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-visible')
      revealObserver.unobserve(entry.target)
    }
  },
  { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
)

for (const el of document.querySelectorAll('[data-anim]')) revealObserver.observe(el)

/* ── Tagline reveal, one word at a time ────────────────────────────────────── */

const ACCENT_WORDS = new Set(['phone,'])

for (const block of document.querySelectorAll('[data-reveal]')) {
  const words = block.textContent.trim().split(/\s+/)
  block.textContent = ''

  for (const word of words) {
    const span = document.createElement('span')
    span.className = ACCENT_WORDS.has(word) ? 'w accent' : 'w'
    span.textContent = word
    block.append(span, document.createTextNode(' '))
  }
}

if (!reduceMotion) {
  const wordObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue

        /* Every word on a line crosses the trigger band at the same moment, so
           without this they would light as a block. Delay by horizontal position
           to carry the cascade left to right, which is the reading order. */
        const word = entry.target
        const lineWidth = word.parentElement.clientWidth || 1
        const across = word.offsetLeft / lineWidth
        word.style.transitionDelay = `${Math.round(across * 260)}ms`

        word.classList.add('on')
        wordObserver.unobserve(word)
      }
    },
    /* A narrow band in the upper half acts as the trigger line, so words light up
       in reading order as the block travels through it. */
    { rootMargin: '-35% 0px -45% 0px', threshold: 0 }
  )

  for (const w of document.querySelectorAll('.reveal .w')) wordObserver.observe(w)
} else {
  for (const w of document.querySelectorAll('.reveal .w')) w.classList.add('on')
}

/* ── Nav ───────────────────────────────────────────────────────────────────── */

const nav = document.getElementById('nav')
const sentinel = document.getElementById('top')

if (nav && sentinel) {
  new IntersectionObserver(
    ([entry]) => nav.classList.toggle('nav--scrolled', !entry.isIntersecting),
    { rootMargin: '-24px 0px 0px 0px' }
  ).observe(sentinel)
}

/* ── Mobile menu ───────────────────────────────────────────────────────────── */

const burger = document.getElementById('burger')
const menu = document.getElementById('menu')

if (burger && menu) {
  menu.hidden = false

  const setMenu = (open) => {
    menu.dataset.open = String(open)
    burger.setAttribute('aria-expanded', String(open))
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
    document.body.style.overflow = open ? 'hidden' : ''
  }

  burger.addEventListener('click', () => {
    setMenu(burger.getAttribute('aria-expanded') !== 'true')
  })

  for (const link of menu.querySelectorAll('a')) {
    link.addEventListener('click', () => setMenu(false))
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setMenu(false)
      burger.focus()
    }
  })
}

/* ── Current section in the nav ────────────────────────────────────────────── */

const navLinks = [...document.querySelectorAll('.nav__links a[href^="#"]')]
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean)

if (sections.length > 0) {
  const seen = new Set()

  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) seen.add(entry.target.id)
        else seen.delete(entry.target.id)
      }

      const active = sections.find((section) => seen.has(section.id))

      for (const link of navLinks) {
        const isCurrent = active != null && link.getAttribute('href') === `#${active.id}`
        if (isCurrent) link.setAttribute('aria-current', 'page')
        else link.removeAttribute('aria-current')
      }
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  )

  for (const section of sections) spy.observe(section)
}

/* ── Demo form ─────────────────────────────────────────────────────────────── */

const form = document.getElementById('demo-form')
const emailField = document.getElementById('email')
const errorLine = document.getElementById('email-err')
const okLine = document.getElementById('demo-ok')
const submit = document.getElementById('demo-submit')

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* Free mail domains: this is a business enquiry form, so a work address matters. */
const FREE_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'icloud.com',
  'me.com',
  'proton.me',
  'protonmail.com'
])

const showError = (message) => {
  errorLine.textContent = message
  emailField.setAttribute('aria-invalid', 'true')
}

const clearError = () => {
  errorLine.textContent = ''
  emailField.removeAttribute('aria-invalid')
}

if (form && emailField && errorLine && okLine && submit) {
  emailField.addEventListener('input', clearError)

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const value = emailField.value.trim()

    if (value === '') {
      showError('Enter your work email so we can reply.')
      emailField.focus()
      return
    }

    if (!EMAIL_PATTERN.test(value)) {
      showError('That does not look like an email address. Check it and try again.')
      emailField.focus()
      return
    }

    const domain = value.split('@')[1].toLowerCase()

    if (FREE_DOMAINS.has(domain)) {
      showError('Use your work email address. We reply with a quote for your company.')
      emailField.focus()
      return
    }

    clearError()
    submit.dataset.loading = 'true'
    submit.textContent = 'Opening your mail app'

    const subject = encodeURIComponent('Cadence demo request')
    const body = encodeURIComponent(
      [
        'Hello Cadence team,',
        '',
        `Please book a demo. My work email is ${value}.`,
        '',
        'Company:',
        'Headcount:',
        'Country:',
        ''
      ].join('\n')
    )

    window.location.href = `mailto:${DEMO_EMAIL}?subject=${subject}&body=${body}`

    okLine.hidden = false
    okLine.textContent = `Your mail app should open now. If it does not, write to ${DEMO_EMAIL}.`

    submit.dataset.loading = 'false'
    submit.textContent = 'Book a demo'
  })
}
