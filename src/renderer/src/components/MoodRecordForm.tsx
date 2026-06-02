import { useCallback, useEffect, useRef, useState } from "react";

import type { EntryRow, AiInsightRow } from "../../../main/database";

import type { FatigueCheck } from "../../../shared/types";

import { resolveTagLists } from "../data/tagLists";

import { formatClockLocal, formatDateShort } from "../utils/formatTime";

import { restoreEntryToForm } from "../utils/entryFormRestore";

import { getQuadrantLabel } from "../utils/entryParse";

import { ZH } from "../i18n/zh";

import RecordViewportForm from "./RecordViewportForm";

function calcFatigueCoord(data: FatigueCheck): { x: number; y: number } {
  const x = Math.max(
    -4,
    Math.min(4, Math.round((data.decision_quality - 4) * 0.6)),
  );

  const loadBase =
    data.decision_load === "极多" ? 3 : data.decision_load === "少" ? -1 : 1;

  const symptoms = [data.hesitate, data.escapeTendency, data.brainFog].filter(
    Boolean,
  ).length;

  const y = Math.min(4, Math.max(-4, loadBase + symptoms));

  return { x, y };
}

interface Props {
  variant?: "page" | "popup" | "modal";

  isFatigueCheck?: boolean;

  editEntryId?: number;

  initialData?: EntryRow;

  onSaved: (updated?: EntryRow) => void;

  onCancel?: () => void;

  onViewInsight?: () => void;
}

function FatigueSection({
  data,

  onChange,
}: {
  data: FatigueCheck;

  onChange: (next: FatigueCheck) => void;
}): JSX.Element {
  const setField = <K extends keyof FatigueCheck>(
    key: K,
    value: FatigueCheck[K],
  ): void => {
    onChange({ ...data, [key]: value });
  };

  const { x, y } = calcFatigueCoord(data);

  const quadrantName = getQuadrantLabel(x, y);

  const coordStr = `(${x > 0 ? `+${x}` : x}, ${y > 0 ? `+${y}` : y})`;

  const symptoms = [data.hesitate, data.escapeTendency, data.brainFog].filter(
    Boolean,
  ).length;

  return (
    <div className="fatigue-section record-viewport__card">
      <div className="fatigue-section__header">
        <p className="fatigue-section__title">{ZH.fatigueTitle}</p>

        <p className="fatigue-section__subtitle">{ZH.fatigueSubtitle}</p>
      </div>

      <div className="fatigue-section__field">
        <span className="fatigue-section__label">{ZH.fatigueQuality}</span>

        <div className="fatigue-section__quality-row">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              type="button"
              className={`fatigue-quality-btn fatigue-quality-btn--${n <= 3 ? "low" : n >= 7 ? "high" : "mid"}${data.decision_quality === n ? " is-active" : ""}`}
              onClick={() => setField("decision_quality", n)}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="fatigue-quality-legend">
          <span>极差</span>
          <span>极优</span>
        </div>
      </div>

      <div className="fatigue-section__field">
        <span className="fatigue-section__label">{ZH.fatigueDecisionLoad}</span>

        <div className="fatigue-section__radio-group">
          {(["少", "正常", "极多"] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={`fatigue-section__radio-btn${data.decision_load === v ? " is-active" : ""}`}
              onClick={() => setField("decision_load", v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="fatigue-section__field">
        <span className="fatigue-section__label">{ZH.fatigueChecks}</span>

        <label className="fatigue-section__checkbox-row">
          <input
            type="checkbox"
            checked={data.hesitate}
            onChange={(e) => setField("hesitate", e.target.checked)}
          />

          {ZH.fatigueHesitate}
        </label>

        <label className="fatigue-section__checkbox-row">
          <input
            type="checkbox"
            checked={data.escapeTendency}
            onChange={(e) => setField("escapeTendency", e.target.checked)}
          />

          {ZH.fatigueEscape}
        </label>

        <label className="fatigue-section__checkbox-row">
          <input
            type="checkbox"
            checked={data.brainFog}
            onChange={(e) => setField("brainFog", e.target.checked)}
          />

          {ZH.fatigueBrainFog}
        </label>
      </div>

      <p className="fatigue-section__auto-hint">
        {ZH.fatigueAutoCoord(symptoms, quadrantName, coordStr)}
      </p>
    </div>
  );
}

const DEFAULT_FATIGUE: FatigueCheck = {
  decision_load: "正常",

  hesitate: false,

  escapeTendency: false,

  brainFog: false,

  decision_quality: 5,
};

export default function MoodRecordForm({
  variant = "page",

  isFatigueCheck = false,

  editEntryId,

  initialData,

  onSaved,

  onCancel,

  onViewInsight,
}: Props): JSX.Element {
  const isPopup = variant === "popup";

  const isEdit = editEntryId != null;

  const [recordTimeLabel, setRecordTimeLabel] = useState("");

  const [dateLabel, setDateLabel] = useState(formatDateShort());

  const [diaryText, setDiaryText] = useState("");

  const [coordX, setCoordX] = useState(0);

  const [coordY, setCoordY] = useState(0);

  const [hasCoordSelection, setHasCoordSelection] = useState(false);

  const [fatigueData, setFatigueData] = useState<FatigueCheck>(DEFAULT_FATIGUE);

  const [saving, setSaving] = useState(false);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const [closing, setClosing] = useState(false);

  const [error, setError] = useState("");

  const [focusZone, setFocusZone] = useState<"coord" | "diary" | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const [occurredAtIso, setOccurredAtIso] = useState(() =>
    new Date().toISOString(),
  );

  const [editLoading, setEditLoading] = useState(isEdit);

  const [lastRecordTimeLabel, setLastRecordTimeLabel] = useState<string | null>(
    null,
  );

  const [latestInsight, setLatestInsight] = useState<AiInsightRow | null>(null);

  const loadLastRecordTime = useCallback(async (): Promise<void> => {
    const all = await window.api.listAllEntries();

    const latest = all.find(
      (e) => !(isEdit && editEntryId != null && e.id === editEntryId),
    );

    if (!latest) {
      setLastRecordTimeLabel(null);

      return;
    }

    setLastRecordTimeLabel(formatClockLocal(new Date(latest.occurred_at)));
  }, [editEntryId, isEdit]);

  useEffect(() => {
    if (isEdit) return;

    setDateLabel(formatDateShort());
  }, [isEdit]);

  const fillForm = useCallback((row: EntryRow, thoughtTagOptions: string[]) => {
    const restored = restoreEntryToForm(row, thoughtTagOptions);

    setDiaryText(restored.diaryText);

    setCoordX(restored.coordX);

    setCoordY(restored.coordY);

    setHasCoordSelection(true);

    setOccurredAtIso(restored.occurredAt);

    setRecordTimeLabel(formatClockLocal(new Date(restored.occurredAt)));

    setDateLabel(formatDateShort(new Date(restored.occurredAt)));

    setEditLoading(false);
  }, []);

  useEffect(() => {
    if (isEdit && editEntryId != null) setEditLoading(true);

    void window.api.getSettings().then((s) => {
      const lists = resolveTagLists(s.tagLists);
      if (!isEdit || editEntryId == null) return;

      if (initialData && initialData.id === editEntryId) {
        fillForm(initialData, lists.thoughtTags);

        return;
      }

      void window.api.getEntry(editEntryId).then((row) => {
        if (!row) {
          setError(ZH.historyEntryMissing);

          setEditLoading(false);

          return;
        }

        fillForm(row, lists.thoughtTags);
      });
    });
  }, [editEntryId, fillForm, initialData, isEdit]);

  useEffect(() => {
    if (isEdit) return;

    void loadLastRecordTime();
  }, [isEdit, loadLastRecordTime]);

  useEffect(() => {
    if (isEdit || isPopup) return;

    void window.api.getLatestAiInsight(3).then(setLatestInsight);
  }, [isEdit, isPopup]);

  const pickCoord = useCallback((x: number, y: number): void => {
    setCoordX(x);

    setCoordY(y);

    setHasCoordSelection(true);
  }, []);

  const submitForm = useCallback(async (): Promise<void> => {
    setError("");

    if (!isFatigueCheck && !hasCoordSelection) {
      setError(ZH.selectCoord);

      return;
    }

    const autoCoord = isFatigueCheck ? calcFatigueCoord(fatigueData) : null;

    const finalX = autoCoord ? autoCoord.x : coordX;

    const finalY = autoCoord ? autoCoord.y : coordY;

    const trimmedDiary = diaryText.trim();

    setSaving(true);

    try {
      const payload = {
        fact: trimmedDiary,

        thought: "",

        bodyTags: [],

        behaviorTags: [],

        reactionNote: trimmedDiary,

        coordX: finalX,

        coordY: finalY,

        fatigueCheck: isFatigueCheck ? JSON.stringify(fatigueData) : null,

        occurredAt: isEdit ? occurredAtIso : new Date().toISOString(),
      };

      let updated: EntryRow | undefined;

      if (isEdit && editEntryId != null) {
        const row = await window.api.updateEntry(editEntryId, payload);

        if (!row) {
          setError(ZH.saveFail);

          return;
        }

        updated = row;
      } else {
        await window.api.createEntry(payload);

        setDiaryText("");

        setCoordX(0);

        setCoordY(0);

        setHasCoordSelection(false);

        setFatigueData(DEFAULT_FATIGUE);

        void loadLastRecordTime();
      }

      onSaved(updated);

      if (isPopup) {
        setSaveSuccess(true);

        await new Promise((r) => setTimeout(r, 320));

        setClosing(true);

        await new Promise((r) => setTimeout(r, 280));

        window.close();
      }
    } catch {
      setError(ZH.saveFail);
    } finally {
      setSaving(false);
    }
  }, [
    hasCoordSelection,

    coordX,

    coordY,

    diaryText,

    fatigueData,

    editEntryId,

    isEdit,

    isFatigueCheck,

    isPopup,

    occurredAtIso,

    onSaved,

    loadLastRecordTime,
  ]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    void submitForm();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (isPopup && e.key === "Escape") {
        e.preventDefault();

        void window.api.snoozeCheckIn();

        return;
      }

      const inTextField =
        (e.target as HTMLElement)?.tagName === "INPUT" ||
        (e.target as HTMLElement)?.tagName === "TEXTAREA";

      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();

        void submitForm();

        return;
      }

      if (!isPopup && e.key === "Enter" && !inTextField && !e.shiftKey) {
        e.preventDefault();

        void submitForm();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [isPopup, submitForm]);

  if (editLoading) {
    return <p className="hint">{ZH.loading}</p>;
  }

  const fatigueExtra = isFatigueCheck ? (
    <FatigueSection data={fatigueData} onChange={setFatigueData} />
  ) : undefined;

  const insightBanner =
    !isEdit && !isPopup && latestInsight ? (
      <div className="ai-insight-banner" role="note">
        <div className="ai-insight-banner__text">
          <span className="ai-insight-banner__label">
            {ZH.insightBannerTitle(latestInsight.date)}
          </span>

          <span className="ai-insight-banner__summary">
            {latestInsight.key_insight}
          </span>
        </div>

        {onViewInsight ? (
          <button
            type="button"
            className="ai-insight-banner__link"
            onClick={onViewInsight}
          >
            {ZH.insightViewDetail}
          </button>
        ) : null}
      </div>
    ) : null;

  return (
    <>
      {insightBanner}

      <RecordViewportForm
        formRef={formRef}
        variant={variant}
        closing={closing}
        recordTimeLabel={recordTimeLabel}
        dateLabel={dateLabel}
        lastRecordTimeLabel={lastRecordTimeLabel}
        isEdit={isEdit}
        coordX={coordX}
        coordY={coordY}
        hasCoordSelection={hasCoordSelection}
        onPickCoord={pickCoord}
        focusZone={focusZone}
        setFocusZone={setFocusZone}
        diaryText={diaryText}
        setDiaryText={setDiaryText}
        isFatigueCheck={isFatigueCheck}
        fatigueExtra={fatigueExtra}
        error={error}
        saving={saving}
        saveSuccess={saveSuccess}
        onCancel={onCancel}
        onSubmit={handleSubmit}
      />
    </>
  );
}
