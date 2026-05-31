import { useCallback, useEffect, useState } from 'react'
import { ZH } from '../i18n/zh'
import { GITHUB_RELEASES_URL } from '../../../shared/update'

type Phase = 'idle' | 'checking' | 'latest' | 'available' | 'error'

/** 设置页：检查 / 手动下载应用更新（通过 GitHub API 检测，打开浏览器下载） */
export default function AppUpdatePanel(): JSX.Element {
  const [phase, setPhase] = useState<Phase>('idle')
  const [currentVersion, setCurrentVersion] = useState('')
  const [latestVersion, setLatestVersion] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    void window.api.getUpdateInfo().then((info) => {
      setCurrentVersion(info.currentVersion)
    })
  }, [])

  const check = useCallback(async (): Promise<void> => {
    setPhase('checking')
    setErrorMsg('')
    const result = await window.api.checkForUpdate()
    setCurrentVersion(result.currentVersion)

    if (result.status === 'latest') {
      setLatestVersion(result.latestVersion)
      setPhase('latest')
      return
    }
    if (result.status === 'available') {
      setLatestVersion(result.latestVersion)
      setPhase('available')
      return
    }
    if (result.status === 'error') {
      setErrorMsg(result.message)
      setPhase('error')
      return
    }
    setPhase('latest')
  }, [])

  const openReleases = useCallback((): void => {
    void window.api.openExternalUrl(GITHUB_RELEASES_URL)
  }, [])

  return (
    <div className="quiet-box app-update-panel">
      <h3>{ZH.updateTitle}</h3>
      <p className="hint">{ZH.updateDesc}</p>
      <p className="app-update-panel__version">
        {ZH.updateCurrent(currentVersion || '…')}
      </p>

      {phase === 'latest' ? <p className="hint app-update-panel__ok">{ZH.updateLatest}</p> : null}
      {phase === 'available' ? (
        <p className="hint app-update-panel__new">{ZH.updateFound(latestVersion)}</p>
      ) : null}
      {phase === 'error' ? (
        <p className="error app-update-panel__error">{ZH.updateError(errorMsg)}</p>
      ) : null}

      <div className="row actions app-update-panel__actions">
        {phase !== 'available' ? (
          <button
            type="button"
            className="btn secondary"
            disabled={phase === 'checking'}
            onClick={() => void check()}
          >
            {phase === 'checking' ? ZH.updateChecking : ZH.updateCheck}
          </button>
        ) : null}

        {phase === 'available' ? (
          <button type="button" className="btn primary" onClick={openReleases}>
            {ZH.updateDownloadManual}
          </button>
        ) : null}

        <button type="button" className="btn ghost" onClick={openReleases}>
          {ZH.updateOpenReleases}
        </button>
      </div>
    </div>
  )
}
