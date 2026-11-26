import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { Button, Input, Modal } from "../../components";
import { PLAYER_CATEGORIES, type PlayerCategory } from "../../lib/constants";
import { toDateInputValue } from "../../lib/dates";
import { zodResolver } from "../../lib/zodResolver";
import { trainingSchema, type TrainingFormValues } from "./trainingSchema";

interface TrainingFormModalProps {
  open: boolean;
  initialCategory?: string;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: TrainingFormValues) => Promise<void>;
}

function getDefaultCategory(value?: string): PlayerCategory {
  if (value && (PLAYER_CATEGORIES as readonly string[]).includes(value)) {
    return value as PlayerCategory;
  }
  return PLAYER_CATEGORIES[1];
}

export function TrainingFormModal({
  open,
  initialCategory,
  saving,
  error,
  onClose,
  onSubmit,
}: TrainingFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      date: toDateInputValue(new Date()),
      category: getDefaultCategory(initialCategory),
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        date: toDateInputValue(new Date()),
        category: getDefaultCategory(initialCategory),
        notes: "",
      });
    }
  }, [open, initialCategory, reset]);

  return (
    <Modal open={open} onClose={saving ? () => undefined : onClose} title="Novo treino">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Data do treino"
          type="date"
          error={errors.date?.message}
          {...register("date")}
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="training-category"
            className="text-sm font-medium text-slate-800"
          >
            Categoria
          </label>
          <select
            id="training-category"
            aria-invalid={Boolean(errors.category)}
            className={`min-h-[44px] w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-slate-900 focus:outline-2 focus:outline-offset-1 ${
              errors.category
                ? "border-rose-500 focus:outline-rose-600"
                : "border-slate-300 focus:border-emerald-700 focus:outline-emerald-700"
            }`}
            {...register("category")}
          >
            {PLAYER_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category?.message && (
            <p role="alert" className="text-xs font-medium text-rose-600">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="training-notes"
            className="text-sm font-medium text-slate-800"
          >
            Observação (opcional)
          </label>
          <textarea
            id="training-notes"
            rows={3}
            maxLength={300}
            placeholder="Ex.: Treino técnico de passe e coletivo"
            aria-invalid={Boolean(errors.notes)}
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-offset-1 ${
              errors.notes
                ? "border-rose-500 focus:outline-rose-600"
                : "border-slate-300 focus:border-emerald-700 focus:outline-emerald-700"
            }`}
            {...register("notes")}
          />
          {errors.notes?.message && (
            <p role="alert" className="text-xs font-medium text-rose-600">
              {errors.notes.message}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            {saving ? "Salvando..." : "Criar treino"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
