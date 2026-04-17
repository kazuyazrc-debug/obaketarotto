import { useCallback, useEffect, useRef, useState } from 'react'

type SoundEffectName = 'select' | 'shuffle' | 'result' | 'hover' | 'share'

const SOUND_STORAGE_KEY = 'obake-tarot-sound'
const BGM_SRC = '/audio/tarot-bgm.mp3'
const BGM_VOLUME = 0.018

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const noiseBufferRef = useRef<AudioBuffer | null>(null)
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null)
  const isSoundEnabledRef = useRef(true)
  const hasUnlockedAudioRef = useRef(false)
  const hasBgmStartedRef = useRef(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.localStorage.getItem(SOUND_STORAGE_KEY) !== 'off'
  })
  const [isAudioReady, setIsAudioReady] = useState(false)

  const ensureBgmAudio = useCallback(() => {
    if (typeof window === 'undefined') {
      return null
    }

    if (!bgmAudioRef.current) {
      const audio = new Audio(BGM_SRC)
      audio.loop = true
      audio.preload = 'none'
      audio.volume = BGM_VOLUME
      bgmAudioRef.current = audio
    }

    return bgmAudioRef.current
  }, [])

  const createNoiseBuffer = useCallback((context: AudioContext) => {
    const duration = 0.42
    const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate)
    const channel = buffer.getChannelData(0)

    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * 0.32
    }

    return buffer
  }, [])

  const ensureAudioContext = useCallback(async () => {
    if (typeof window === 'undefined') {
      return null
    }

    const windowWithWebkit = window as Window & typeof globalThis & {
      webkitAudioContext?: typeof AudioContext
    }
    const AudioContextConstructor = windowWithWebkit.AudioContext ?? windowWithWebkit.webkitAudioContext
    if (!AudioContextConstructor) {
      return null
    }

    let context = audioContextRef.current

    if (!context) {
      context = new AudioContextConstructor()
      audioContextRef.current = context

      const masterGain = context.createGain()
      masterGain.gain.value = 0.22
      masterGain.connect(context.destination)
      masterGainRef.current = masterGain
      noiseBufferRef.current = createNoiseBuffer(context)
    }

    if (context.state === 'suspended') {
      await context.resume()
    }

    setIsAudioReady(true)
    hasUnlockedAudioRef.current = true
    return context
  }, [createNoiseBuffer])

  useEffect(() => {
    isSoundEnabledRef.current = isSoundEnabled
  }, [isSoundEnabled])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleFirstInteraction = () => {
      void ensureAudioContext()
    }

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true, passive: true })
    window.addEventListener('keydown', handleFirstInteraction, { once: true })

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [ensureAudioContext])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(SOUND_STORAGE_KEY, isSoundEnabled ? 'on' : 'off')
  }, [isSoundEnabled])

  useEffect(() => {
    const audio = bgmAudioRef.current
    if (!audio) {
      return
    }

    audio.volume = BGM_VOLUME

    if (!isSoundEnabled) {
      audio.pause()
      return
    }

    if (hasBgmStartedRef.current) {
      void audio.play().catch(() => {})
    }
  }, [isSoundEnabled])

  useEffect(() => {
    return () => {
      const context = audioContextRef.current
      if (context) {
        void context.close()
      }

      const audio = bgmAudioRef.current
      if (audio) {
        audio.pause()
        audio.src = ''
      }
    }
  }, [])

  const withMaster = useCallback((context: AudioContext) => {
    return masterGainRef.current ?? context.destination
  }, [])

  const playSelectSound = useCallback((context: AudioContext) => {
    const output = withMaster(context)
    const start = context.currentTime + 0.01
    const notes = [
      { offset: 0, frequency: 1174.66, gain: 0.03 },
      { offset: 0.06, frequency: 1567.98, gain: 0.024 },
      { offset: 0.13, frequency: 1760, gain: 0.02 },
    ]

    notes.forEach(({ offset, frequency, gain }, index) => {
      const oscillator = context.createOscillator()
      const shimmer = context.createOscillator()
      const toneGain = context.createGain()
      const filter = context.createBiquadFilter()

      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(frequency, start + offset)
      shimmer.type = 'sine'
      shimmer.frequency.setValueAtTime(frequency * 2, start + offset)

      filter.type = 'highpass'
      filter.frequency.value = 780 + index * 120

      toneGain.gain.setValueAtTime(0.0001, start + offset)
      toneGain.gain.linearRampToValueAtTime(gain, start + offset + 0.018)
      toneGain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.34)

      oscillator.connect(filter)
      shimmer.connect(filter)
      filter.connect(toneGain)
      toneGain.connect(output)

      oscillator.start(start + offset)
      shimmer.start(start + offset)
      oscillator.stop(start + offset + 0.36)
      shimmer.stop(start + offset + 0.32)
    })
  }, [withMaster])

  const playShuffleSound = useCallback((context: AudioContext) => {
    const output = withMaster(context)
    const start = context.currentTime + 0.01
    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const shimmer = context.createBiquadFilter()
    const gain = context.createGain()

    source.buffer = noiseBufferRef.current ?? createNoiseBuffer(context)

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2400, start)
    filter.frequency.exponentialRampToValueAtTime(460, start + 0.28)
    filter.Q.value = 0.9

    shimmer.type = 'highpass'
    shimmer.frequency.value = 320

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.linearRampToValueAtTime(0.035, start + 0.028)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3)

    source.playbackRate.setValueAtTime(1.1, start)
    source.playbackRate.exponentialRampToValueAtTime(0.84, start + 0.28)

    source.connect(filter)
    filter.connect(shimmer)
    shimmer.connect(gain)
    gain.connect(output)

    source.start(start)
    source.stop(start + 0.3)
  }, [createNoiseBuffer, withMaster])

  const playResultSound = useCallback((context: AudioContext) => {
    const output = withMaster(context)
    const start = context.currentTime + 0.01
    const notes = [
      { offset: 0, frequency: 523.25, gain: 0.035, sustain: 1.1 },
      { offset: 0.12, frequency: 659.25, gain: 0.028, sustain: 1.2 },
      { offset: 0.26, frequency: 783.99, gain: 0.022, sustain: 1.4 },
    ]

    notes.forEach(({ offset, frequency, gain, sustain }, index) => {
      const primary = context.createOscillator()
      const halo = context.createOscillator()
      const filter = context.createBiquadFilter()
      const noteGain = context.createGain()

      primary.type = 'triangle'
      halo.type = 'sine'
      primary.frequency.setValueAtTime(frequency, start + offset)
      halo.frequency.setValueAtTime(frequency * 1.5, start + offset)

      filter.type = 'lowpass'
      filter.frequency.value = 2200 - index * 180

      noteGain.gain.setValueAtTime(0.0001, start + offset)
      noteGain.gain.linearRampToValueAtTime(gain, start + offset + 0.04)
      noteGain.gain.exponentialRampToValueAtTime(0.0001, start + offset + sustain)

      primary.connect(filter)
      halo.connect(filter)
      filter.connect(noteGain)
      noteGain.connect(output)

      primary.start(start + offset)
      halo.start(start + offset)
      primary.stop(start + offset + sustain + 0.05)
      halo.stop(start + offset + sustain * 0.82)
    })
  }, [withMaster])

  const playHoverSound = useCallback((context: AudioContext) => {
    const output = withMaster(context)
    const start = context.currentTime + 0.005
    const primary = context.createOscillator()
    const overtone = context.createOscillator()
    const gain = context.createGain()
    const filter = context.createBiquadFilter()

    primary.type = 'sine'
    overtone.type = 'triangle'
    primary.frequency.setValueAtTime(1320, start)
    overtone.frequency.setValueAtTime(1760, start + 0.012)

    filter.type = 'highpass'
    filter.frequency.value = 980

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.linearRampToValueAtTime(0.012, start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18)

    primary.connect(filter)
    overtone.connect(filter)
    filter.connect(gain)
    gain.connect(output)

    primary.start(start)
    overtone.start(start + 0.01)
    primary.stop(start + 0.2)
    overtone.stop(start + 0.18)
  }, [withMaster])

  const playShareSound = useCallback((context: AudioContext) => {
    const output = withMaster(context)
    const start = context.currentTime + 0.005
    const clickNoise = context.createBufferSource()
    const clickFilter = context.createBiquadFilter()
    const clickGain = context.createGain()
    const seal = context.createOscillator()
    const sealGain = context.createGain()

    clickNoise.buffer = noiseBufferRef.current ?? createNoiseBuffer(context)
    clickFilter.type = 'bandpass'
    clickFilter.frequency.setValueAtTime(1900, start)
    clickFilter.frequency.exponentialRampToValueAtTime(720, start + 0.09)
    clickFilter.Q.value = 1.4

    clickGain.gain.setValueAtTime(0.0001, start)
    clickGain.gain.linearRampToValueAtTime(0.022, start + 0.01)
    clickGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12)

    seal.type = 'triangle'
    seal.frequency.setValueAtTime(440, start + 0.04)
    seal.frequency.exponentialRampToValueAtTime(330, start + 0.22)

    sealGain.gain.setValueAtTime(0.0001, start + 0.04)
    sealGain.gain.linearRampToValueAtTime(0.016, start + 0.065)
    sealGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.26)

    clickNoise.connect(clickFilter)
    clickFilter.connect(clickGain)
    clickGain.connect(output)
    seal.connect(sealGain)
    sealGain.connect(output)

    clickNoise.start(start)
    clickNoise.stop(start + 0.12)
    seal.start(start + 0.04)
    seal.stop(start + 0.28)
  }, [createNoiseBuffer, withMaster])

  const play = useCallback(async (name: SoundEffectName) => {
    if (!isSoundEnabledRef.current) {
      return
    }

    const context = await ensureAudioContext()
    if (!context) {
      return
    }

    if (name === 'select') {
      playSelectSound(context)
      return
    }

    if (name === 'shuffle') {
      playShuffleSound(context)
      return
    }

    if (name === 'hover') {
      playHoverSound(context)
      return
    }

    if (name === 'share') {
      playShareSound(context)
      return
    }

    playResultSound(context)
  }, [ensureAudioContext, playHoverSound, playResultSound, playSelectSound, playShareSound, playShuffleSound])

  const startBgm = useCallback(async () => {
    if (!isSoundEnabledRef.current) {
      return
    }

    await ensureAudioContext()

    if (!hasUnlockedAudioRef.current) {
      return
    }

    const audio = ensureBgmAudio()
    if (!audio) {
      return
    }

    audio.volume = BGM_VOLUME
    hasBgmStartedRef.current = true
    await audio.play().catch(() => {})
  }, [ensureAudioContext, ensureBgmAudio])

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((current) => !current)
  }, [])

  const playSelect = useCallback(() => {
    void play('select')
  }, [play])

  const playShuffle = useCallback(() => {
    void play('shuffle')
  }, [play])

  const playResult = useCallback(() => {
    void play('result')
  }, [play])

  const playHover = useCallback(() => {
    void play('hover')
  }, [play])

  const playShare = useCallback(() => {
    void play('share')
  }, [play])

  return {
    isAudioReady,
    isSoundEnabled,
    playHover,
    playResult,
    playSelect,
    playShare,
    playShuffle,
    startBgm,
    toggleSound,
  }
}
