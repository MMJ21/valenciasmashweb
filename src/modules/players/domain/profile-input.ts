import { z } from "zod";
import { CHARACTERS } from "./characters";

const characterIds = new Set(CHARACTERS.map(({ id }) => id));

export const playerProfileInputSchema = z
  .object({
    gamertag: z.string().trim().min(1).max(64),
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    twitter: z.string().trim().max(64),
    twitch: z.string().trim().max(64),
    bio: z.string().trim().max(500),
    characters: z
      .array(
        z.object({
          id: z.string().refine((id) => characterIds.has(id), "Personaje no válido."),
          isMain: z.boolean(),
        }),
      )
      .max(2),
  })
  .superRefine((profile, context) => {
    const ids = new Set(profile.characters.map(({ id }) => id));
    if (ids.size !== profile.characters.length) {
      context.addIssue({ code: "custom", message: "No repitas personajes.", path: ["characters"] });
    }
    if (
      profile.characters.length > 0 &&
      profile.characters.filter(({ isMain }) => isMain).length !== 1
    ) {
      context.addIssue({
        code: "custom",
        message: "Selecciona exactamente un personaje principal.",
        path: ["characters"],
      });
    }
  });

export type PlayerProfileInput = z.infer<typeof playerProfileInputSchema>;
