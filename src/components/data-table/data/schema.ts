import { z } from "zod";

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const rewardSchema = z.object({
  redemption_registries_id: z.string().nullable(),
  tenant_id: z.string(),
  redemption_id: z.string(),
  cpid: z.string(),
  redemption_type: z.string(),
  value: z.string(),
  redem_value: z.string(),
  name: z.string(),
  inventory_remaining: z.string().nullable(),
  title: z.string(),
  startdate: z.string().nullable(),
  enddate: z.string().nullable(),
  reward_status: z.string(),
  language: z.string(),
  reward_availability: z.string(),
  utid: z.string(),
  valueType: z.string(),
  tags: z.string().nullable(),
  priority: z.string(),
});

export type Reward = z.infer<typeof rewardSchema>;

export const rewardsSchema = z.array(rewardSchema);
export type Rewards = z.infer<typeof rewardsSchema>;
