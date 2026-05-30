import * as z from 'zod';

export const predictorSchema = z.object({
  rank: z.coerce.number().min(1, "Rank must be greater than 0").max(2000000, "Rank is too high"),
  category: z.string(),
  quota: z.string(),
  gender: z.string(),
  instituteTypes: z.array(z.string()).optional(),
  states: z.array(z.string()).optional(),
  branches: z.array(z.string()).optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  jee_rank: z.coerce.number().min(1).optional(),
  category: z.string().optional(),
  state: z.string().optional(),
});

export type PredictorInput = z.infer<typeof predictorSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
