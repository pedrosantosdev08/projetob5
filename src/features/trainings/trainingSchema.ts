import { z } from "zod";
import { PLAYER_CATEGORIES } from "../../lib/constants";
import { parseDateInput } from "../../lib/dates";

function isValidTrainingDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = parseDateInput(value);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day &&
    year >= 2020 &&
    year <= 2035
  );
}

export const trainingSchema = z.object({
  date: z
    .string()
    .min(1, "Informe a data do treino.")
    .refine(isValidTrainingDate, "Informe uma data válida."),
  category: z.enum(PLAYER_CATEGORIES, {
    errorMap: () => ({ message: "Selecione a categoria." }),
  }),
  notes: z
    .string()
    .trim()
    .max(300, "A observação pode ter no máximo 300 caracteres.")
    .optional(),
});

export type TrainingFormValues = z.infer<typeof trainingSchema>;

export const saveAttendanceSchema = z.object({
  trainingId: z.string().min(1, "Treino inválido."),
  category: z.string().min(1, "Categoria inválida."),
  date: z.date(),
  entries: z
    .array(
      z.object({
        playerId: z.string().min(1),
        present: z.boolean(),
      })
    )
    .min(1, "Nenhum jogador ativo para registrar chamada."),
});

export type SaveAttendanceInput = z.infer<typeof saveAttendanceSchema>;
