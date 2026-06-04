import { useCallback, useEffect, useRef, useState } from "react";

import type { EntryRow } from "../../../main/database";

import { resolveTagLists } from "../data/tagLists";

import { beijingDateKey, nowBeijingIso, todayBeijingDateKey } from "../../../shared/beijingTime";
import {
  getDailyEntryIndex,
  getNextDailyEntryIndex,
} from "../utils/dailyEntryIndex";
import { formatClockLocal, formatDateShort } from "../utils/formatTime";

import { restoreEntryToForm } from "../utils/entryFormRestore";

import { ZH } from "../i18n/zh";

import { useEntriesRefresh } from "../hooks/useDataRefresh";

import RecordViewportForm from "./RecordViewportForm";

interface Props {
  variant?: "page" | "popup" | "modal";

  editEntryId?: number;

  initialData?: EntryRow;

  onSaved: (updated?: EntryRow) => void;

  onCancel?: () => void;
}

export default function MoodRecordForm({
  variant = "page",

  editEntryId,

  initialData,

  onSaved,

  onCancel,
}: Props): JSX.Element {
  const isPopup = variant === "popup";

  const isEdit = editEntryId != null;

  const [recordTimeLabel, setRecordTimeLabel] = useState("");

  const [dateLabel, setDateLabel] = useState(formatDateShort());

  const [diaryText, setDiaryText] = useState("");

  const [coordX, setCoordX] = useState(0);

  const [coordY, setCoordY] = useState(0);

  const [hasCoordSelection, setHasCoordSelection] = useState(false);

  const [saving, setSaving] = useState(false);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const [closing, setClosing] = useState(false);

  const [error, setError] = useState("");

  const [focusZone, setFocusZone] = useState<"coord" | "diary" | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const [occurredAtIso, setOccurredAtIso] = useState(() => nowBeijingIso());

  const [editLoading, setEditLoading] = useState(isEdit);

  const [lastRecordTimeLabel, setLastRecordTimeLabel] = useState<string | null>(
    null,
  );

  const [dailyIndexLabel, setDailyIndexLabel] = useState<string | null>(null);

  const loadDailyIndexLabel = useCallback(async (): Promise<void> => {
    const all = await window.api.listAllEntries();
    if (isEdit && editEntryId != null) {
      const row =
        initialData?.id === editEntryId
          ? initialData
          : await window.api.getEntry(editEntryId);
      if (!row) {
        setDailyIndexLabel(null);
        return;
      }
      const dk = beijingDateKey(row.occurred_at);
      const meta = getDailyEntryIndex(all, editEntryId, dk);
      setDailyIndexLabel(
        meta ? ZH.recordDailyIndexEdit(meta.index, meta.total) : null,
      );
      return;
    }
    const meta = getNextDailyEntryIndex(all, todayBeijingDateKey());
    setDailyIndexLabel(ZH.recordDailyIndexNew(meta.index));
  }, [editEntryId, initialData, isEdit]);

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

  useEntriesRefresh(() => {
    void loadDailyIndexLabel();
    if (isEdit) return;

    void loadLastRecordTime();
  }, [isEdit, loadLastRecordTime, loadDailyIndexLabel]);

  useEffect(() => {
    void loadDailyIndexLabel();
  }, [loadDailyIndexLabel]);

  const pickCoord = useCallback((x: number, y: number): void => {
    setCoordX(x);

    setCoordY(y);

    setHasCoordSelection(true);
  }, []);

  const submitForm = useCallback(async (): Promise<void> => {
    setError("");

    if (!hasCoordSelection) {
      setError(ZH.selectCoord);

      return;
    }

    const trimmedDiary = diaryText.trim();

    setSaving(true);

    try {
      const payload = {
        fact: trimmedDiary,

        thought: "",

        bodyTags: [],

        behaviorTags: [],

        reactionNote: trimmedDiary,

        coordX,

        coordY,

        fatigueCheck: null,

        occurredAt: isEdit ? occurredAtIso : nowBeijingIso(),
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

        void loadLastRecordTime();
        void loadDailyIndexLabel();
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

    editEntryId,

    isEdit,

    isPopup,

    occurredAtIso,

    onSaved,

    loadLastRecordTime,
    loadDailyIndexLabel,
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

  return (
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
        error={error}
        saving={saving}
        saveSuccess={saveSuccess}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        dailyIndexLabel={dailyIndexLabel}
      />
  );
}
