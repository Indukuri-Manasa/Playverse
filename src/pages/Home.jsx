import GameCard from '../components/games/GameCard'
import GameRow from '../components/games/GameRow'
import Hero from '../components/home/Hero'
import GameOfTheDay from '../components/home/GameOfTheDay'
import DailyChallenge from '../components/home/DailyChallenge'
import CategoryCard from '../components/home/CategoryCard'
import StatsPanel from '../components/home/StatsPanel'
import AchievementGrid from '../components/home/AchievementGrid'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { games, getGame } from '../data/games'
import { categories, getCategory } from '../data/categories'
import { usePlayerStats } from '../hooks/usePlayerStats'
import { personalBest } from '../utils/stats'
import { plural, timeAgo } from '../utils/format'

export default function Home() {
  const stats = usePlayerStats()
  const { scores, activity } = stats

  // Trending = your most-played games on this device (ties keep library order).
  const trending = [...games].sort((a, b) => (activity.sessions[b.id] ?? 0) - (activity.sessions[a.id] ?? 0))
  const recent = activity.recent.map((r) => ({ ...r, game: getGame(r.id) })).filter((r) => r.game).slice(0, 4)

  return (
    <>
      <Hero playerName={activity.playerName} unlocked={stats.unlocked} totalAchievements={stats.achievements.length} />

      <div className="container page-sections">
        <section>
          <SectionHeader icon="sparkle" eyebrow="Handpicked" title="Featured Games" link="/explore" />
          <div className="game-grid">
            {games.map((g) => (
              <GameCard key={g.id} game={g} best={personalBest(g, scores, activity)} />
            ))}
          </div>
        </section>

        <section className="split-2">
          <GameOfTheDay scores={scores} activity={activity} />
          <DailyChallenge activity={activity} />
        </section>

        <section>
          <SectionHeader icon="grid" eyebrow="Browse" title="Game Categories" link="/categories" linkLabel="All categories" />
          <div className="category-grid">
            {categories.map((c) => <CategoryCard key={c.id} category={c} />)}
          </div>
        </section>

        <section className="split-2 split-even">
          <div className="panel">
            <SectionHeader icon="flame" eyebrow="Your most played" title="Trending" />
            <div className="row-list">
              {trending.map((g, i) => (
                <GameRow
                  key={g.id}
                  game={g}
                  rank={i + 1}
                  sub={g.categories.map((c) => getCategory(c)?.short).join(' · ')}
                  meta={plural(activity.sessions[g.id] ?? 0, 'play')}
                />
              ))}
            </div>
          </div>

          <div className="panel">
            <SectionHeader icon="clock" eyebrow="Jump back in" title="Recently Played" />
            {recent.length ? (
              <div className="row-list">
                {recent.map((r) => (
                  <GameRow key={r.id} game={r.game} sub={timeAgo(r.at)} meta={`${personalBest(r.game, scores, activity).value ?? '—'}`} />
                ))}
              </div>
            ) : (
              <div className="empty">
                <Icon name="gamepad" size={30} />
                <p>Nothing played yet. Your recent games will show up here.</p>
                <Button to="/explore" variant="secondary" size="sm">Find a game</Button>
              </div>
            )}
          </div>
        </section>

        <section>
          <SectionHeader icon="chart" eyebrow="Your numbers" title="Player Statistics" link="/profile" linkLabel="Profile" />
          <StatsPanel stats={stats} wide />
        </section>

        <section>
          <SectionHeader
            icon="trophy"
            eyebrow={`${stats.unlocked} of ${stats.achievements.length} unlocked`}
            title="Achievement Showcase"
            link="/profile"
            linkLabel="Your profile"
          />
          <AchievementGrid achievements={stats.achievements} />
        </section>
      </div>
    </>
  )
}
