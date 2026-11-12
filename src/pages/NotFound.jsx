import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'

export default function NotFound() {
  return (
    <div className="container page">
      <section className="panel not-found">
        <span className="not-found-code">404</span>
        <h1>Game over — page not found</h1>
        <p className="muted">That page or game doesn’t exist.</p>
        <Button to="/"><Icon name="home" size={16} /> Back to games</Button>
      </section>
    </div>
  )
}
