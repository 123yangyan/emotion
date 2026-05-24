import { useCallback, useEffect, useState } from 'react'
import { ZH } from '../i18n/zh'
import { GITHUB_RELEASES_URL } from '../../../shared/update'

type Phase = 'idle' | 'checking' | 'latest' | 'available' | 'downloading' | 'ready' | 'error' | 'dev'

/** 设置页：检查 / 下载 / 安装应用更新 */
export default function AppUpdatePanel(): JSX.Element {
  const [phase, setPhase] = useState<Phase>('idle')
  const [currentVersion, setCurrentVersion] = useState('')
  const [latestVersion, setLatestVersion] = useState('')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    void window.api.getUpdateInfo().then((info) => {
      setCurrentVersion(info.currentVersion)
      if (!info.canCheck) setPhase('dev')
    })

    const offProgress = window.api.onUpdateProgress((percent) => {
      setProgress(percent)
    })
    return offProgress
  }, [])

  const check = useCallback(async (): Promise<void> => {
    setPhase('checking')
    setErrorMsg('')
    const result = await window.api.checkForUpdate()
    setCurrentVersion(result.currentVersion)

    if (result.status === 'dev') {
      setPhase('dev')
      return
    }
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
    setErrorMsg(result.message)
    setPhase('error')
  }, [])

  const download = useCallback(async (): Promise<void> => {
    setPhase('downloading')
    setProgress(0)
    setErrorMsg('')
    const result = await window.api.downloadUpdate()
    if (!result.ok) {
      setErrorMsg(result.message === 'dev-mode' ? ZH.updateDevOnly : result.message)
      setPhase('error')
      return
    }
    setPhase('ready')
  }, [])

  const install = useCallback((): void => {
    window.api.installUpdate()
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

      {phase === 'dev' ? <p className="hint">{ZH.updateDevOnly}</p> : null}
      {phase === 'latest' ? <p className="hint app-update-panel__ok">{ZH.updateLatest}</p> : null}
      {phase === 'available' ? (
        <p className="hint app-update-panel__new">{ZH.updateFound(latestVersion)}</p>
      ) : null}
      {phase === 'downloading' ? (
        <p className="hint">{ZH.updateDownloading(Math.round(progress))}</p>
      ) : null}
      {phase === 'ready' ? (
        <p className="hint app-update-panel__ok">{ZH.updateReady(latestVersion)}</p>
      ) : null}
      {phase === 'error' ? (
        <p className="error app-update-panel__error">{ZH.updateError(errorMsg)}</p>
      ) : null}

      <div className="row actions app-update-panel__actions">
        {phase !== 'dev' && phase !== 'available' && phase !== 'downloading' && phase !== 'ready' ? (
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
          <button type="button" className="btn primary" onClick={() => void download()}>
            {ZH.updateDownload}
          </button>
        ) : null}

        {phase === 'ready' ? (
          <button type="button" className="btn primary" onClick={install}>
            {ZH.updateInstall}
          </button>
        ) : null}

        <button type="button" className="btn ghost" onClick={openReleases}>
          {ZH.updateOpenReleases}
        </button>
      </div>
    </div>
  )
}
