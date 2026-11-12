import { Link } from 'react-router-dom'

// Variants: primary (neon gradient), secondary (glass), ghost (outline)
export default function Button({ variant = 'primary', size, className = '', to, ...props }) {
  const cls = `btn btn-${variant} ${size ? `btn-${size}` : ''} ${className}`.replace(/\s+/g, ' ').trim()
  if (to) return <Link to={to} className={cls} {...props} />
  return <button className={cls} {...props} />
}
