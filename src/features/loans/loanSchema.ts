import { z } from "zod/v3";

export const loanSchema = z.object({
  materialId: z.string().min(1, "Selecione o material"),
  playerId: z.string().min(1, "Selecione o jogador"),
  quantity: z
    .number({ invalid_type_error: "Informe a quantidade" })
    .int("A quantidade deve ser um número inteiro")
    .min(1, "A quantidade mínima é 1"),
  notes: z.string().max(300, "Máximo 300 caracteres"),
});

export type LoanFormValues = z.infer<typeof loanSchema>;
