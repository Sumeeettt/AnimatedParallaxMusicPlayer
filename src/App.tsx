import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion"
import {
  ChevronLeft,
  Heart,
  ListMusic,
  MonitorCog,
  MoreHorizontal,
  Moon,
  Pause,
  Play,
  Repeat2,
  RotateCcw,
  Shuffle,
  SkipBack,
  SkipForward,
  Sun,
  Volume2,
  VolumeX,
} from "lucide-react"

const tracks = [
  {
    title: "Electric Feel",
    artist: "Luna Wave",
    album: "Neon Dreams",
    duration: 224,
    color: "#d65f86",
    image:
      "https://images.unsplash.com/photo-1562680467-41ea705b371a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=88&w=1200&h=1200",
  },
  {
    title: "Midnight Drive",
    artist: "Nico Vale",
    album: "Nocturne / 04",
    duration: 258,
    color: "#6d9dff",
    image:
      "https://images.unsplash.com/photo-1517231461833-7301fb461719?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=88&w=1200&h=1200",
  },
  {
    title: "Slow Motion",
    artist: "Echo Club",
    album: "Soft Collision",
    duration: 196,
    color: "#d8bd86",
    image:
      "https://images.unsplash.com/photo-1644353224392-7e532d7b8f4b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=88&w=1200&h=1200",
  },
]

const bars = [
  28, 45, 68, 52, 84, 40, 72, 92, 58, 78, 48, 64, 38, 80, 54, 70, 32,
]

type ThemeMode = "auto" | "light" | "dark"

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds))
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`
}

function IconButton({
  label,
  active = false,
  children,
  onClick,
  className = "",
}: {
  label: string
  active?: boolean
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <motion.button
      aria-label={label}
      className={`icon-button ${active ? "is-active" : ""} ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.08, rotate: active ? 0 : 2 }}
      whileTap={{ scale: 0.9 }}
      type="button"
    >
      {children}
    </motion.button>
  )
}

function App() {
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(42)
  const [liked, setLiked] = useState(true)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [volume, setVolume] = useState(72)
  const [previousVolume, setPreviousVolume] = useState(72)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [isCardFlipping, setIsCardFlipping] = useState(false)
  const [themeMode, setThemeMode] = useState<ThemeMode>("auto")
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() =>
    window.matchMedia?.("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark",
  )
  const sceneRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const track = tracks[trackIndex]
  const activeTheme = themeMode === "auto" ? systemTheme : themeMode

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, {
    stiffness: 85,
    damping: 22,
    mass: 0.65,
  })
  const smoothY = useSpring(pointerY, {
    stiffness: 85,
    damping: 22,
    mass: 0.65,
  })
  const artX = useTransform(smoothX, [-1, 1], [-30, 30])
  const artY = useTransform(smoothY, [-1, 1], [-20, 20])
  const artRotateX = useTransform(smoothY, [-1, 1], [8, -8])
  const artRotateY = useTransform(smoothX, [-1, 1], [-10, 10])
  const imageX = useTransform(smoothX, [-1, 1], [9, -9])
  const imageY = useTransform(smoothY, [-1, 1], [7, -7])
  const glowX = useTransform(smoothX, [-1, 1], [55, -55])
  const glowY = useTransform(smoothY, [-1, 1], [42, -42])
  const infoX = useTransform(smoothX, [-1, 1], [14, -14])
  const infoY = useTransform(smoothY, [-1, 1], [10, -10])
  const queueX = useTransform(smoothX, [-1, 1], [-11, 11])
  const queueY = useTransform(smoothY, [-1, 1], [-7, 7])
  const orbitX = useTransform(smoothX, [-1, 1], [-38, 38])
  const orbitY = useTransform(smoothY, [-1, 1], [-28, 28])
  const farX = useTransform(smoothX, [-1, 1], [32, -32])
  const farY = useTransform(smoothY, [-1, 1], [24, -24])
  const cursorX = useTransform(smoothX, [-1, 1], ["-45vw", "45vw"])
  const cursorY = useTransform(smoothY, [-1, 1], ["-42vh", "42vh"])

  useEffect(() => {
    if (!isPlaying) return
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          setTrackIndex((index) => (index + 1) % tracks.length)
          return 0
        }
        return current + 100 / track.duration
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isPlaying, track.duration])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)")
    const updateTheme = (event: MediaQueryListEvent | MediaQueryList) =>
      setSystemTheme(event.matches ? "light" : "dark")

    updateTheme(mediaQuery)
    mediaQuery.addEventListener("change", updateTheme)
    return () => mediaQuery.removeEventListener("change", updateTheme)
  }, [])

  useEffect(() => {
    setIsCardFlipped(false)
  }, [trackIndex])

  const selectTrack = (index: number) => {
    setTrackIndex(index)
    setProgress(0)
    setIsPlaying(true)
  }

  const changeTrack = (direction: number) => {
    const next = shuffle
      ? Math.floor(Math.random() * tracks.length)
      : (trackIndex + direction + tracks.length) % tracks.length
    selectTrack(next)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !sceneRef.current) return
    const bounds = sceneRef.current.getBoundingClientRect()
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 2)
    pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 2)
  }

  const resetPointer = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  const currentSeconds = (progress / 100) * track.duration
  const cycleTheme = () => {
    setThemeMode((current) =>
      current === "auto" ? "light" : current === "light" ? "dark" : "auto",
    )
  }

  return (
    <main
      className={`player-shell ${activeTheme}`}
      onPointerLeave={resetPointer}
      onPointerMove={handlePointerMove}
      ref={sceneRef}
    >
      <div aria-hidden="true" className="noise-layer" />
      <motion.div
        aria-hidden="true"
        className="cursor-aura"
        style={{ x: cursorX, y: cursorY }}
      />
      <motion.div
        aria-hidden="true"
        className="spectrum-field spectrum-field-left"
        style={{ x: farX, y: farY }}
      />
      <motion.div
        aria-hidden="true"
        className="spectrum-field spectrum-field-right"
        style={{ x: glowX, y: glowY }}
      />
      <motion.div
        aria-hidden="true"
        className="ambient ambient-one"
        style={{ x: glowX, y: glowY }}
      />
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        className="ambient ambient-two"
        transition={{ duration: 24, ease: "linear", repeat: Infinity }}
      />

      <nav className="topbar">
        <div className="brand" aria-label="Stereo music player">
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          STEREO
        </div>
        <div className="topbar-center">
          <span className="live-dot" />
          NOW PLAYING
        </div>
        <div className="nav-actions">
          <motion.button
            aria-label={`Theme mode: ${themeMode}. Change theme mode`}
            className="theme-switch"
            onClick={cycleTheme}
            title={`Theme: ${themeMode}`}
            whileTap={{ scale: 0.94 }}
            type="button"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                className="theme-icon"
                key={themeMode}
                initial={{ opacity: 0, rotate: -35, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 35, scale: 0.7 }}
                transition={{ duration: 0.18 }}
              >
                {themeMode === "auto" ? (
                  <MonitorCog size={15} />
                ) : themeMode === "light" ? (
                  <Sun size={15} />
                ) : (
                  <Moon size={15} />
                )}
              </motion.span>
            </AnimatePresence>
            <span>{themeMode}</span>
          </motion.button>
          <IconButton label="Open queue">
            <ListMusic size={19} />
          </IconButton>
        </div>
      </nav>

      <section className="player-grid">
        <motion.aside
          className="track-copy"
          initial={reduceMotion ? false : { opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ x: reduceMotion ? 0 : infoX, y: reduceMotion ? 0 : infoY }}
        >
          <span className="eyebrow">
            PLAYING FROM / {track.album.toUpperCase()}
          </span>
          <AnimatePresence mode="wait">
            <motion.div
              key={track.title}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 24, filter: "blur(8px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1>{track.title}</h1>
              <p className="artist">{track.artist}</p>
            </motion.div>
          </AnimatePresence>
          <p className="descriptor">Synth-pop · 2025</p>

          <div className="waveform" aria-hidden="true">
            {bars.map((height, index) => (
              <motion.span
                key={index}
                animate={
                  isPlaying && !reduceMotion
                    ? { scaleY: [0.35, 1, 0.55, 0.8, 0.35] }
                    : { scaleY: 0.35 }
                }
                style={{ height: `${height}%`, backgroundColor: track.color }}
                transition={{
                  duration: 1.2 + (index % 4) * 0.15,
                  delay: index * 0.035,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        </motion.aside>

        <motion.div
          className="art-stage"
          style={{ x: reduceMotion ? 0 : orbitX, y: reduceMotion ? 0 : orbitY }}
        >
          <motion.div
            className="orbit orbit-outer"
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 34, ease: "linear", repeat: Infinity }}
          >
            <span />
          </motion.div>
          <motion.div
            className="orbit orbit-inner"
            animate={reduceMotion ? undefined : { rotate: -360 }}
            transition={{ duration: 18, ease: "linear", repeat: Infinity }}
          >
            <span />
          </motion.div>
          <motion.div
            className="art-shadow"
            style={{ x: reduceMotion ? 0 : glowX, y: reduceMotion ? 0 : glowY }}
          />
          <motion.div
            className="album-card"
            style={{
              x: reduceMotion ? 0 : artX,
              y: reduceMotion ? 0 : artY,
              rotateX: reduceMotion || isCardFlipping ? 0 : artRotateX,
              rotateY: reduceMotion || isCardFlipping ? 0 : artRotateY,
            }}
            whileHover={reduceMotion ? undefined : { scale: 1.025 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
          >
            <motion.button
              aria-label={
                isCardFlipped
                  ? "Show album artwork"
                  : "Flip card to view track details"
              }
              aria-pressed={isCardFlipped}
              animate={{
                rotateX: isCardFlipped ? 180 : 0,
                z: reduceMotion ? 0 : [0, 72, 0],
              }}
              className="album-card-inner"
              disabled={isCardFlipping}
              initial={false}
              onAnimationComplete={() => setIsCardFlipping(false)}
              onClick={() => {
                setIsCardFlipping(true)
                setIsCardFlipped((flipped) => !flipped)
              }}
              transition={
                reduceMotion
                  ? { duration: 0.01 }
                  : {
                      rotateX: {
                        duration: 0.84,
                        ease: [0.65, 0, 0.35, 1],
                      },
                      z: {
                        duration: 0.84,
                        ease: [0.33, 1, 0.68, 1],
                        times: [0, 0.5, 1],
                      },
                    }
              }
              type="button"
            >
              <div className="album-face album-front">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={track.image}
                    src={track.image}
                    alt={`Album artwork for ${track.title} by ${track.artist}`}
                    style={{
                      x: reduceMotion ? 0 : imageX,
                      y: reduceMotion ? 0 : imageY,
                    }}
                    initial={reduceMotion ? false : { opacity: 0, scale: 1.12 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </AnimatePresence>
                <div
                  className="art-wash"
                  style={
                    { "--track-color": track.color } as React.CSSProperties
                  }
                />
                <div className="flip-hint">
                  <RotateCcw size={12} />
                  <span>FLIP</span>
                </div>
                <div className="album-label">
                  <span>ST — 0{trackIndex + 1}</span>
                  <span>{track.album}</span>
                </div>
                <motion.div
                  aria-hidden="true"
                  className="sheen"
                  animate={reduceMotion ? undefined : { x: ["-140%", "180%"] }}
                  transition={{
                    duration: 4.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
              </div>

              <div className="album-face album-back">
                <div
                  className="back-glow"
                  style={
                    { "--track-color": track.color } as React.CSSProperties
                  }
                />
                <div className="back-header">
                  <span>STEREO ARCHIVE</span>
                  <span>
                    0{trackIndex + 1} / 0{tracks.length}
                  </span>
                </div>
                <div className="back-record">
                  <motion.div
                    animate={
                      isPlaying && !reduceMotion ? { rotate: 360 } : undefined
                    }
                    className="record-disc"
                    transition={{
                      duration: 8,
                      ease: "linear",
                      repeat: Infinity,
                    }}
                  >
                    <img src={track.image} alt="" />
                    <i />
                  </motion.div>
                </div>
                <div className="back-copy">
                  <span className="back-kicker">NOW PLAYING</span>
                  <strong>{track.title}</strong>
                  <p>{track.artist}</p>
                </div>
                <div className="back-spectrum" aria-hidden="true">
                  {bars.slice(0, 13).map((height, index) => (
                    <motion.i
                      key={index}
                      animate={
                        isPlaying && !reduceMotion
                          ? { scaleY: [0.3, 1, 0.45, 0.3] }
                          : { scaleY: 0.35 }
                      }
                      style={{
                        height: `${height}%`,
                        backgroundColor: track.color,
                      }}
                      transition={{
                        duration: 0.8 + (index % 4) * 0.18,
                        delay: index * 0.04,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </div>
                <div className="back-footer">
                  <span>{track.album}</span>
                  <span>{formatTime(track.duration)} · HI–RES</span>
                </div>
                <div className="flip-back">
                  <RotateCcw size={12} />
                  <span>TAP TO RETURN</span>
                </div>
              </div>
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.aside
          className="queue-panel"
          style={{
            x: reduceMotion ? 0 : queueX,
            y: reduceMotion ? 0 : queueY,
          }}
        >
          <div className="queue-heading">
            <span>UP NEXT</span>
            <span>0{tracks.length}</span>
          </div>
          <div className="queue-list">
            {tracks.map((item, index) => (
              <motion.button
                className={`queue-item ${
                  trackIndex === index ? "current" : ""
                }`}
                key={item.title}
                onClick={() => selectTrack(index)}
                whileHover={{ x: 6 }}
                type="button"
              >
                <span className="queue-number">
                  {trackIndex === index && isPlaying ? (
                    <span className="mini-bars">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : (
                    `0${index + 1}`
                  )}
                </span>
                <span className="queue-art">
                  <img src={item.image} alt="" />
                </span>
                <span className="queue-meta">
                  <strong>{item.title}</strong>
                  <small>{item.artist}</small>
                </span>
                <span className="queue-time">{formatTime(item.duration)}</span>
              </motion.button>
            ))}
          </div>
        </motion.aside>
      </section>

      <section className="control-deck" aria-label="Playback controls">
        <div className="utility-controls">
          <IconButton
            label="Shuffle"
            active={shuffle}
            onClick={() => setShuffle(!shuffle)}
          >
            <Shuffle size={17} />
          </IconButton>
          <IconButton
            label={liked ? "Remove from favorites" : "Add to favorites"}
            active={liked}
            onClick={() => setLiked(!liked)}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
          </IconButton>
        </div>

        <div className="transport">
          <IconButton label="Previous track" onClick={() => changeTrack(-1)}>
            <SkipBack size={21} fill="currentColor" />
          </IconButton>
          <motion.button
            aria-label={isPlaying ? "Pause" : "Play"}
            className="play-button"
            onClick={() => setIsPlaying(!isPlaying)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.9 }}
            type="button"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isPlaying ? "pause" : "play"}
                initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.6 }}
                transition={{ duration: 0.16 }}
              >
                {isPlaying ? (
                  <Pause size={24} fill="currentColor" />
                ) : (
                  <Play size={24} fill="currentColor" />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>
          <IconButton label="Next track" onClick={() => changeTrack(1)}>
            <SkipForward size={21} fill="currentColor" />
          </IconButton>
        </div>

        <div className="volume-control">
          <IconButton
            label={volume === 0 ? "Unmute" : "Mute"}
            onClick={() => {
              if (volume > 0) {
                setPreviousVolume(volume)
                setVolume(0)
              } else setVolume(previousVolume || 72)
            }}
          >
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </IconButton>
          <input
            aria-label="Volume"
            className="volume-range"
            max="100"
            min="0"
            onChange={(event) => setVolume(Number(event.target.value))}
            style={{ "--volume": `${volume}%` } as React.CSSProperties}
            type="range"
            value={volume}
          />
          <IconButton
            label="Repeat"
            active={repeat}
            onClick={() => setRepeat(!repeat)}
          >
            <Repeat2 size={17} />
          </IconButton>
          <IconButton label="More options">
            <MoreHorizontal size={20} />
          </IconButton>
        </div>

        <div className="timeline">
          <span>{formatTime(currentSeconds)}</span>
          <div className="progress-wrap">
            <input
              aria-label="Track progress"
              className="progress-range"
              max="100"
              min="0"
              onChange={(event) => setProgress(Number(event.target.value))}
              style={
                {
                  "--progress": `${progress}%`,
                  "--track-color": track.color,
                } as React.CSSProperties
              }
              type="range"
              value={progress}
            />
          </div>
          <span>-{formatTime(track.duration - currentSeconds)}</span>
        </div>
      </section>

      <footer>
        <span>STEREO SYSTEM / 2025</span>
        <span className="footer-hint">
          <ChevronLeft size={13} />
          MOVE TO EXPLORE
        </span>
        <span>HI–RES AUDIO</span>
      </footer>
    </main>
  )
}

export default App
