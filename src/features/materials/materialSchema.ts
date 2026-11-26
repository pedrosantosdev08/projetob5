import { z } from "zod";

export const materialSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome do material.")
    .max(80, "O nome pode ter no máximo 80 caracteres."),
  totalQuantity: z
    .number({ invalid_type_error: "Informe a quantidade total." })
    .int("Informe um número inteiro.")
    .min(0, "A quantidade não pode ser negativa.")
    .max(9999, "Quantidade máxima de 9999 unidades."),
  active: z.boolean(),
});

export type MaterialFormValues = z.infer<typeof materialSchema>;
