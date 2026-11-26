import { useState } from "react";
import { Package, Pencil, Plus } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components";
import { MaterialFormModal } from "./MaterialFormModal";
import type { MaterialFormValues } from "./materialSchema";
import type { Material } from "./materialTypes";
import { useMaterialMutations } from "./useMaterialMutations";
import { useMaterials } from "./useMaterials";

export default function MaterialsPage() {
  const {
    materials,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
    reload,
  } = useMaterials();

  const { saveMaterial, saving, mutationError, clearError } =
    useMaterialMutations();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const openCreateModal = () => {
    clearError();
    setEditingMaterial(null);
    setModalOpen(true);
  };

  const openEditModal = (material: Material) => {
    clearError();
    setEditingMaterial(material);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSubmit = async (values: MaterialFormValues) => {
    try {
      await saveMaterial(values, editingMaterial?.id);
      setModalOpen(false);
      await reload();
    } catch {
      // Erro já exibido no modal via mutationError.
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Materiais</h1>
          <p className="text-sm text-slate-600">
            Estoque e disponibilidade de materiais esportivos.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Novo</span>
        </Button>
      </header>

      {loading ? (
        <LoadingState message="Carregando materiais..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : materials.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" aria-hidden="true" />}
          title="Nenhum material cadastrado"
          description="Cadastre bolas, coletes, cones e outros materiais para controlar os empréstimos."
          action={
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Cadastrar material</span>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          <ul className="space-y-2.5">
            {materials.map((material) => {
              const loanedCount = Math.max(
                0,
                material.totalQuantity - material.availableQuantity
              );

              return (
                <li key={material.id}>
                  <Card className="flex items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-slate-900">
                          {material.name}
                        </h2>
                        {!material.active && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                            Inativo
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-semibold ${
                            material.availableQuantity > 0
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {material.availableQuantity} de {material.totalQuantity}{" "}
                          {material.availableQuantity === 1
                            ? "disponível"
                            : "disponíveis"}
                        </span>

                        {loanedCount > 0 && (
                          <span className="text-slate-600">
                            {loanedCount}{" "}
                            {loanedCount === 1 ? "emprestado" : "emprestados"}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openEditModal(material)}
                      aria-label={`Editar ${material.name}`}
                      className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      <span>Editar</span>
                    </button>
                  </Card>
                </li>
              );
            })}
          </ul>

          {loadMoreError && (
            <p role="alert" className="text-center text-xs font-medium text-rose-600">
              {loadMoreError}
            </p>
          )}

          {hasMore && (
            <Button
              variant="secondary"
              loading={loadingMore}
              onClick={loadMore}
              className="w-full"
            >
              {loadingMore ? "Carregando..." : "Carregar mais"}
            </Button>
          )}
        </div>
      )}

      <MaterialFormModal
        open={modalOpen}
        material={editingMaterial}
        saving={saving}
        error={mutationError}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
