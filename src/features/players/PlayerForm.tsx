import { useForm } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { Button, Card, Input } from "../../components";
import { PLAYER_CATEGORIES } from "../../lib/constants";
import { calculateAge, parseDateInput } from "../../lib/dates";
import { zodResolver } from "../../lib/zodResolver";
import { playerSchema, type PlayerFormValues } from "./playerSchema";

interface PlayerFormProps {
  defaultValues?: Partial<PlayerFormValues>;
  submitLabel: string;
  saving: boolean;
  error: string | null;
  onSubmit: (values: PlayerFormValues) => Promise<void>;
  onCancel: () => void;
}

export function PlayerForm({
  defaultValues,
  submitLabel,
  saving,
  error,
  onSubmit,
  onCancel,
}: PlayerFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      birthDate: defaultValues?.birthDate ?? "",
      category: defaultValues?.category ?? PLAYER_CATEGORIES[1],
      neighborhood: defaultValues?.neighborhood ?? "",
      guardianName: defaultValues?.guardianName ?? "",
      guardianPhone: defaultValues?.guardianPhone ?? "",
      guardianConsent: defaultValues?.guardianConsent ?? false,
    },
  });

  const watchedBirthDate = watch("birthDate");
  const estimatedAge =
    /^\d{4}-\d{2}-\d{2}$/.test(watchedBirthDate) &&
    !Number.isNaN(parseDateInput(watchedBirthDate).getTime())
      ? calculateAge(parseDateInput(watchedBirthDate))
      : null;

  return (
    <Card className="p-5">
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
          label="Nome completo"
          placeholder="Ex.: Lucas Gabriel Silva"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Data de nascimento"
            type="date"
            helperText={
              estimatedAge !== null
                ? `Idade calculada: ${estimatedAge} ${estimatedAge === 1 ? "ano" : "anos"}`
                : undefined
            }
            error={errors.birthDate?.message}
            {...register("birthDate")}
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="player-category"
              className="text-sm font-medium text-slate-800"
            >
              Categoria
            </label>
            <select
              id="player-category"
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
        </div>

        <Input
          label="Bairro"
          placeholder="Ex.: Boa Vista"
          error={errors.neighborhood?.message}
          {...register("neighborhood")}
        />

        <div className="border-t border-slate-100 pt-2">
          <p className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Dados do responsável
          </p>

          <div className="space-y-4">
            <Input
              label="Nome do responsável"
              placeholder="Ex.: Maria da Silva"
              error={errors.guardianName?.message}
              {...register("guardianName")}
            />

            <Input
              label="Telefone do responsável"
              type="tel"
              inputMode="tel"
              placeholder="(81) 99999-9999"
              error={errors.guardianPhone?.message}
              {...register("guardianPhone")}
            />

            <div className="space-y-1.5">
              <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-emerald-700 accent-emerald-700"
                  {...register("guardianConsent")}
                />
                <span className="text-sm leading-snug text-slate-700">
                  Confirmo que o responsável autorizou o cadastro dos dados do
                  menor para gestão do Projeto B5.
                </span>
              </label>
              {errors.guardianConsent?.message && (
                <p role="alert" className="text-xs font-medium text-rose-600">
                  {errors.guardianConsent.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            {saving ? "Salvando..." : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
