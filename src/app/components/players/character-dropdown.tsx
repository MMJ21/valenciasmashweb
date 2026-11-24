"use client";

import Image from "next/image";
import { useState } from "react";
import { CHARACTERS } from "@/modules/players/public/characters";

interface CharacterDropdownProps {
  readonly fieldId: string;
  readonly label: string;
  readonly selectedId: string | null;
  readonly excludedId?: string | null;
  readonly disabled?: boolean;
  readonly onSelect: (characterId: string | null) => void;
}

export function CharacterDropdown({
  fieldId,
  label,
  selectedId,
  excludedId,
  disabled = false,
  onSelect,
}: CharacterDropdownProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCharacter = CHARACTERS.find(({ id }) => id === selectedId);
  const options = CHARACTERS.filter((character) => character.id !== excludedId);

  function choose(characterId: string | null): void {
    onSelect(characterId);
    setIsOpen(false);
  }

  return (
    <div className="character-dropdown">
      <span className="form-field-label" id={`${fieldId}-label`}>
        {label}
      </span>
      <button
        aria-controls={`${fieldId}-options`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={`${fieldId}-label ${fieldId}-value`}
        className="character-dropdown-trigger"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        type="button"
      >
        {selectedCharacter === undefined ? (
          <span className="character-dropdown-placeholder" id={`${fieldId}-value`}>
            Selecciona un personaje
          </span>
        ) : (
          <>
            <Image alt="" height={40} src={selectedCharacter.icon} unoptimized width={40} />
            <span id={`${fieldId}-value`}>{selectedCharacter.name}</span>
          </>
        )}
        <span aria-hidden="true" className="character-dropdown-chevron">
          {isOpen ? "⌃" : "⌄"}
        </span>
      </button>
      {isOpen ? (
        <div className="character-dropdown-options" id={`${fieldId}-options`} role="listbox">
          <button
            aria-selected={selectedId === null}
            className="character-dropdown-option character-dropdown-empty"
            onClick={() => choose(null)}
            role="option"
            type="button"
          >
            Ninguno
          </button>
          {options.map((character) => (
            <button
              aria-selected={selectedId === character.id}
              className="character-dropdown-option"
              key={character.id}
              onClick={() => choose(character.id)}
              role="option"
              type="button"
            >
              <Image alt="" height={40} src={character.icon} unoptimized width={40} />
              <span>{character.name}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
