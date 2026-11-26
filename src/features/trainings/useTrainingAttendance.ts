import { useCallback, useEffect, useRef, useState } from "react";
import { listActivePlayersByCategory, type Player } from "../players";
import {
  getAttendanceByTraining,
  getAttendanceErrorMessage,
  saveTrainingAttendance,
} from "./attendanceService";
import { getTrainingById, getTrainingErrorMessage } from "./trainingService";
import type { Training } from "./trainingTypes";

export function useTrainingAttendance(trainingId: string | undefined) {
  const [training, setTraining] = useState<Training | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});
  const [hasExistingAttendance, setHasExistingAttendance] = useState(false);
  const [loading, setLoading] = useState(Boolean(trainingId));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    if (!trainingId) {
      setTraining(null);
      setPlayers([]);
      setPresenceMap({});
      setLoading(false);
      setError(null);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const trainingDoc = await getTrainingById(trainingId);
      if (requestIdRef.current !== currentRequestId) return;

      if (!trainingDoc) {
        setTraining(null);
        setPlayers([]);
        setPresenceMap({});
        setHasExistingAttendance(false);
        setLoading(false);
        return;
      }

      const [activePlayers, existingRecords] = await Promise.all([
        listActivePlayersByCategory(trainingDoc.category),
        getAttendanceByTraining(trainingId),
      ]);

      if (requestIdRef.current !== currentRequestId) return;

      const existingByPlayer = new Map<string, boolean>(
        existingRecords.map((record) => [record.playerId, record.present])
      );

      const initialMap: Record<string, boolean> = {};
      for (const player of activePlayers) {
        initialMap[player.id] = existingByPlayer.get(player.id) ?? false;
      }

      setTraining(trainingDoc);
      setPlayers(activePlayers);
      setPresenceMap(initialMap);
      setHasExistingAttendance(existingRecords.length > 0);
    } catch (err) {
      if (requestIdRef.current !== currentRequestId) return;
      setError(getTrainingErrorMessage(err));
      setTraining(null);
      setPlayers([]);
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
      }
    }
  }, [trainingId]);

  useEffect(() => {
    void load();
  }, [load]);

  const togglePlayer = useCallback((playerId: string) => {
    setSaveSuccess(false);
    setSaveError(null);
    setPresenceMap((prev) => ({
      ...prev,
      [playerId]: !prev[playerId],
    }));
  }, []);

  const markAllPresent = useCallback(() => {
    setSaveSuccess(false);
    setSaveError(null);
    setPresenceMap((prev) => {
      const next: Record<string, boolean> = {};
      for (const key of Object.keys(prev)) {
        next[key] = true;
      }
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    if (!training || players.length === 0) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await saveTrainingAttendance({
        trainingId: training.id,
        category: training.category,
        date: training.date,
        entries: players.map((player) => ({
          playerId: player.id,
          present: Boolean(presenceMap[player.id]),
        })),
      });
      setHasExistingAttendance(true);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(getAttendanceErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }, [players, presenceMap, training]);

  return {
    training,
    players,
    presenceMap,
    hasExistingAttendance,
    loading,
    error,
    saving,
    saveError,
    saveSuccess,
    togglePlayer,
    markAllPresent,
    save,
    reload: load,
  };
}
