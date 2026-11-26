import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Modal } from "../../components";
import { PLAYER_CATEGORIES } from "../../lib/constants";
import { zodResolver } from "../../lib/zodResolver";
import { listMaterials } from "../materials/materialService";
import type { Material } from "../materials/materialTypes";
import { listPlayers } from "../players/playerService";
import type { Player } from "../players/playerTypes";
import { loanSchema, type LoanFormValues } from "./loanSchema";

interface Props {
  open: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: LoanFormValues, materialName: string, playerName: string) => void;
}

export function LoanFormModal({ open, saving, error, onClose, onSubmit }: Props) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: { materialId: "", playerId: "", quantity: 1, notes: "" },
  });

  const selectedMaterialId = watch("materialId");
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const filteredPlayers = useMemo(() => {
    if (categoryFilter === "all") return players;
    return players.filter((p) => p.category === categoryFilter);
  }, [players, categoryFilter]);

  useEffect(() => {
    if (!open) return;
    reset();
    setCategoryFilter("all");
    setLoadingOptions(true);

    Promise.all([
      listMaterials({ pageSize: 100 }),
      listPlayers({ status: "active", category: "", search: "", pageSize: 200 }),
    ])
      .then(([matResult, playResult]) => {
        setMaterials(matResult.items.filter((m) => m.active && m.availableQuantity > 0));
        setPlayers(playResult.items.filter((p) => p.status === "active"));
      })
      .catch(() => {
        // silently ignore — user will see empty selects
      })
      .finally(() => setLoadingOptions(false));
  }, [open, reset]);

  const handleFormSubmit = (values: LoanFormValues) => {
    const mat = materials.find((m) => m.id === values.materialId);
    const pl = players.find((p) => p.id === values.playerId);
    onSubmit(values, mat?.name ?? "", pl?.name ?? "");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo Empréstimo"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="loan-form"
            loading={saving}
            disabled={loadingOptions}
          >
            Registrar
          </Button>
        </div>
      }
    >
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form id="loan-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Material */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Material <span className="text-red-500">*</span>
          </label>
          {loadingOptions ? (
            <p className="text-sm text-slate-500">Carregando opções…</p>
          ) : (
            <select
              {...register("materialId")}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Selecione o material</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.availableQuantity} disponível(is)
                </option>
              ))}
            </select>
          )}
          {errors.materialId && (
            <p className="mt-1 text-xs text-red-600">{errors.materialId.message}</p>
          )}
        </div>

        {/* Jogador */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="block text-sm font-medium text-slate-700">
              Jogador <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Filtrar categoria:</span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setValue("playerId", "");
                }}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="all">Todas</option>
                {PLAYER_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {loadingOptions ? (
            <p className="text-sm text-slate-500">Carregando opções…</p>
          ) : (
            <select
              {...register("playerId")}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Selecione o jogador</option>
              {filteredPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.category}
                </option>
              ))}
            </select>
          )}
          {errors.playerId && (
            <p className="mt-1 text-xs text-red-600">{errors.playerId.message}</p>
          )}
        </div>

        {/* Quantidade */}
        <div>
          <Input
            label="Quantidade"
            type="number"
            min={1}
            max={selectedMaterial?.availableQuantity ?? 999}
            required
            error={errors.quantity?.message}
            {...register("quantity", { valueAsNumber: true })}
          />
          {selectedMaterial && (
            <p className="mt-1 text-xs text-slate-500">
              Disponível: <strong>{selectedMaterial.availableQuantity}</strong>
            </p>
          )}
        </div>

        {/* Observação */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Observação
          </label>
          <textarea
            {...register("notes")}
            rows={2}
            maxLength={300}
            placeholder="Opcional"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {errors.notes && (
            <p className="mt-1 text-xs text-red-600">{errors.notes.message}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}
