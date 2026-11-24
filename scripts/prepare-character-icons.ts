import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { CHARACTERS } from "../src/modules/players/domain/characters";

const sourceDirectory = resolve(process.cwd(), "public", "Stock Icons");
const outputDirectory = resolve(process.cwd(), "public", "characters");

async function prepareIcons(): Promise<void> {
  await mkdir(outputDirectory, { recursive: true });

  for (const character of CHARACTERS) {
    await copyFile(
      resolve(sourceDirectory, character.sourceIcon),
      resolve(outputDirectory, `${character.id}.png`),
    );
  }

  console.info(`Preparados ${CHARACTERS.length} iconos en public/characters.`);
}

await prepareIcons();
