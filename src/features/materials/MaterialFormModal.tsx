import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { Button, Input, Modal } from "../../components";
import { zodResolver } from "../../lib/zodResolver";
import { materialSchema, type MaterialFormValues } from "./materialSchema";
import type { Material } from "./materialTypes";

interface MaterialFormModalProps {
  open: boolean;
  material: Material | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: MaterialFormValues) => Promise<void>;
}

export function MaterialFormModal({
  open,
  material,
  saving,
  error,
  onClose,
  onSubmit,
}: MaterialFormModalProps) {
  const isEditing = Boolean(material);
  const loanedCount = material
    ? Math.max(0, material.totalQuantity - material.availableQuantity)
    : 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: "",
      totalQuantity: 1,
      active: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: material?.name ?? "",
        totalQuantity: material?.totalQuantity ?? 1,
        active: material?.active ?? true,
      });
    }
  }, [open, material, reset]);

  return (
    <Modal
      open={open}
      onClose={saving ? () => undefined : onClose}
      title={isEditing ? "Editar material" : "Novo material"}
    >
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
          label="Nome do material"
          placeholder="Ex.: Bola de futebol nº 4"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Quantidade total"
          type="number"
          inputMode="numeric"
          min={loanedCount}
          max={9999}
          step={1}
          helperText={
            material
              ? `Disponível agora: ${material.availableQuantity} · Emprestado: ${loanedCount}`
              : "Ao cadastrar, toda a quantidade inicia disponível."
          }
          error={errors.totalQuantity?.message}
          {...register("totalQuantity", { valueAsNumber: true })}
        />

        {isEditing && (
          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <input
              type="checkbox"
              className="h-5 w-5 shrink-0 rounded border-slate-300 accent-emerald-700"
              {...register("active")}
            />
            <span className="text-sm font-medium text-slate-700">
              Material ativo para novos empréstimos
            </span>
          </label>
        )}

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
            {saving
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Cadastrar material"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
