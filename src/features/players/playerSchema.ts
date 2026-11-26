import { z } from "zod";
import { PLAYER_CATEGORIES } from "../../lib/constants";
import { parseDateInput } from "../../lib/dates";

function isValidPastDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = parseDateInput(value);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return false;
  }
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return parsed.getTime() <= today.getTime() && year >= 1995;
}

export const playerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome completo (mínimo 2 caracteres).")
    .max(100, "O nome pode ter no máximo 100 caracteres."),
  birthDate: z
    .string()
    .min(1, "Informe a data de nascimento.")
    .refine(isValidPastDate, "Informe uma data de nascimento válida."),
  category: z.enum(PLAYER_CATEGORIES, {
    errorMap: () => ({ message: "Selecione a categoria." }),
  }),
  neighborhood: z
    .string()
    .trim()
    .min(2, "Informe o bairro.")
    .max(80, "O bairro pode ter no máximo 80 caracteres."),
  guardianName: z
    .string()
    .trim()
    .min(2, "Informe o nome do responsável.")
    .max(100, "O nome do responsável pode ter no máximo 100 caracteres."),
  guardianPhone: z
    .string()
    .trim()
    .min(8, "Informe o telefone do responsável.")
    .max(20, "Telefone muito longo.")
    .refine(
      (val) => val.replace(/\D/g, "").length >= 8,
      "Informe um telefone com DDD válido."
    ),
  guardianConsent: z
    .boolean()
    .refine(
      (val) => val === true,
      "É obrigatório confirmar o consentimento do responsável."
    ),
});

export type PlayerFormValues = z.infer<typeof playerSchema>;
