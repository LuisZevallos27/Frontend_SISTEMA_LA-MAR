export default function IconoMesa({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" className={className} aria-hidden="true">
      <ellipse cx="32" cy="22" rx="16" ry="7" />
      <rect x="30" y="26" width="4" height="14" />
      <rect x="22" y="40" width="20" height="3" rx="1.5" />
      <path d="M8 30h4v22H8zM8 44h14v4H8z" />
      <path d="M52 30h4v22h-4zM42 44h14v4H42z" />
    </svg>
  )
}