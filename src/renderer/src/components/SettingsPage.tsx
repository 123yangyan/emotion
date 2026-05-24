import { useEffect, useState } from 'react'
import type { AppSettings, TagListsConfig } from '../../../shared/types'
import { defaultTagLists, resolveTagLists } from '../data/tagLists'
import SettingsTagLists from './SettingsTagLists'
import AppUpdatePanel from './AppUpdatePanel'
import { ZH } from '../i18n/zh'

interface Props {
  onToast: (msg: string) => void
  onTagsSaved?: () => void
}

export default function SettingsPage({ onToast, onTagsSaved }: Props) {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [tagLists, setTagLists] = useState<TagListsConfig>(() => defaultTagLists())
  const [paths, setPaths] = useState<{ dbPath: string; userData: string } | null>(null)
  const [todayEntryCount, setTodayEntryCount] = useState(0)
  const [testReminder, setTestReminder] = useState<{
    scheduled: boolean
    remainingSeconds?: number
  }>({ scheduled: false })

  useEffect(() => {
    void (async () => {
      const loaded = await window.api.getSettings()
      setSettings(loaded)
      setTagLists(resolveTagLists(loaded.tagLists))
      setPaths(await window.api.getDataPath())
      const todayEntries = await window.api.listToday()
      setTodayEntryCount(todayEntries.length)
    })()
  }, [])

  useEffect(() => {
    const refresh = (): void => {
      void window.api.getTestReminderStatus().then(setTestReminder)
    }
    refresh()
    const id = setInterval(refresh, 1000)
    return () => clearInterval(id)
  }, [])

  if (!settings) return <p className="hint">{ZH.settingsLoading}</p>

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]): void => {
    setSettings((s) => (s ? { ...s, [key]: value } : s))
  }

  const save = async (): Promise<void> => {
    await window.api.saveSettings({ ...settings, tagLists })
    onToast(ZH.settingsSaved)
    onTagsSaved?.()
  }

  const testPopup = async (): Promise<void> => {
    await window.api.openCheckInPopup()
  }

  const scheduleTest = async (seconds: number): Promise<void> => {
    const res = await window.api.scheduleTestReminder(seconds)
    onToast(ZH.testReminderScheduled(res.delaySeconds))
    setTestReminder({
      scheduled: true,
      remainingSeconds: res.delaySeconds
    })
  }

  const cancelTest = async (): Promise<void> => {
    await window.api.cancelTestReminder()
    setTestReminder({ scheduled: false })
    onToast(ZH.testReminderCancelled)
  }

  const exportData = async (): Promise<void> => {
    const res = await window.api.exportJson()
    if (res.ok && res.path) onToast(ZH.exportOk(res.path))
    else onToast(ZH.exportCancel)
  }

  return (
    <div className="settings">
      <h2>{ZH.dailyReminder}</h2>
      <p className="hint">{ZH.dailyReminderDesc}</p>

      <label>
        {ZH.reminderInterval}
        <input
          type="number"
          min={0.01}
          max={24}
          step={0.01}
          value={settings.reminderIntervalHours}
          onChange={(e) => update('reminderIntervalHours', Number(e.target.value))}
        />
      </label>
      <p className="hint">{ZH.reminderIntervalHint}</p>

      <div className="quiet-box">
        <h3>{ZH.quietPeriod}</h3>
        <p className="hint">{ZH.quietExample}</p>
        <div className="row quiet-row">
          <label>
            {ZH.quietStart}
            <input
              type="time"
              value={settings.quietStart}
              onChange={(e) => update('quietStart', e.target.value)}
            />
          </label>
          <label>
            {ZH.quietEnd}
            <input
              type="time"
              value={settings.quietEnd}
              onChange={(e) => update('quietEnd', e.target.value)}
            />
          </label>
        </div>
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={settings.notificationsEnabled}
          onChange={(e) => update('notificationsEnabled', e.target.checked)}
        />
        {ZH.notifyOn}
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={settings.strongPopup}
          onChange={(e) => update('strongPopup', e.target.checked)}
        />
        {ZH.popupOn}
      </label>

      <p className="hint">{ZH.recordedToday(todayEntryCount)}</p>

      <div className="quiet-box test-reminder-box">
        <h3>{ZH.testReminderTitle}</h3>
        <p className="hint">{ZH.testReminderDesc}</p>
        <div className="row actions test-reminder-actions">
          <button type="button" className="btn secondary" onClick={() => void scheduleTest(30)}>
            {ZH.testReminder30s}
          </button>
          <button type="button" className="btn secondary" onClick={() => void scheduleTest(60)}>
            {ZH.testReminder60s}
          </button>
          <button type="button" className="btn ghost" onClick={() => void testPopup()}>
            {ZH.previewPopup}
          </button>
        </div>
        {testReminder.scheduled && testReminder.remainingSeconds != null ? (
          <p className="hint test-reminder-countdown">
            {ZH.testReminderPending(testReminder.remainingSeconds)}
          </p>
        ) : null}
        {testReminder.scheduled ? (
          <button type="button" className="btn ghost tag-edit-restore" onClick={() => void cancelTest()}>
            {ZH.testReminderCancel}
          </button>
        ) : null}
      </div>

      <div className="row actions settings-save-block">
        <button type="button" className="btn primary" onClick={() => void save()}>
          {ZH.saveSettings}
        </button>
      </div>
      <p className="hint settings-save-hint">{ZH.saveSettingsHint}</p>

      <hr />

      <SettingsTagLists value={tagLists} onChange={setTagLists} />

      <div className="row actions settings-save-block">
        <button type="button" className="btn primary" onClick={() => void save()}>
          {ZH.saveSettings}
        </button>
      </div>

      <hr />

      <AppUpdatePanel />

      <hr />

      <h2>{ZH.data}</h2>
      {paths && (
        <div className="paths">
          <p>
            <strong>{ZH.dataFile}</strong>
            <br />
            <code>{paths.dbPath}</code>
          </p>
        </div>
      )}
      <button type="button" className="btn secondary" onClick={() => void exportData()}>
        {ZH.exportJson}
      </button>

      <hr />
      <p className="disclaimer">{ZH.disclaimer}</p>
    </div>
  )
}
