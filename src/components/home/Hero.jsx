import Button from '../ui/Button'
import Icon from '../ui/Icon'
import HeroVisual from './HeroVisual'
import { games } from '../../data/games'
import { categories } from '../../data/categories'
import { useRandomGame } from '../../hooks/useRandomGame'

export default function Hero({ playerName, unlocked, totalAchievements }) {
  const playRandom = useRandomGame()
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="hero-badge">
            <span className="pulse-dot" /> Welcome back, {playerName}
          </span>
          <h1>
            <span className="hero-line">Enter the world of</span>
            <span className="hero-title">PlayVerse</span>
          </h1>
          <p className="hero-sub">
            Discover. <span>Play.</span> Compete. <span>Repeat.</span>
          </p>
          <div className="hero-ctas">
            <Button to="/explore" size="lg">
              <Icon name="compass" size={18} /> Explore Games
            </Button>
            <Button variant="secondary" size="lg" onClick={() => playRandom()}>
              <Icon name="shuffle" size={18} /> Random Game
            </Button>
          </div>
          <dl className="hero-stats">
            <div><dt>Games</dt><dd>{games.length}</dd></div>
            <div><dt>Categories</dt><dd>{categories.length}</dd></div>
            <div><dt>Achievements</dt><dd>{unlocked}<small>/{totalAchievements}</small></dd></div>
          </dl>
        </div>
        <HeroVisual />
      </div>
    </section>
  )
}
