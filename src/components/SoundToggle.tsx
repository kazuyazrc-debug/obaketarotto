type SoundToggleProps = {
  isAudioReady: boolean
  isSoundEnabled: boolean
  onToggle: () => void
}

export function SoundToggle({ isAudioReady, isSoundEnabled, onToggle }: SoundToggleProps) {
  return (
    <button
      type="button"
      className={`sound-toggle${isSoundEnabled ? ' is-enabled' : ' is-muted'}`}
      aria-pressed={isSoundEnabled}
      aria-label={isSoundEnabled ? 'サウンドをオフにする' : 'サウンドをオンにする'}
      onClick={onToggle}
    >
      <span className="sound-toggle-dot" aria-hidden="true" />
      <span className="sound-toggle-copy">
        <strong>{isSoundEnabled ? 'Sound ON' : 'Sound OFF'}</strong>
        <small>{isAudioReady ? '効果音' : 'タップで準備'}</small>
      </span>
    </button>
  )
}
