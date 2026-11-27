"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedCharacter = CHARACTERS.find(({ id }) => id === selectedId);
  const options = CHARACTERS.filter((character) => character.id !== excludedId);
  const selectedOptionIndex =
    selectedId === null ? 0 : options.findIndex(({ id }) => id === selectedId) + 1;

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
      return;
    }
    if (isOpen) {
      optionRefs.current[activeOptionIndex]?.focus();
    }
  }, [activeOptionIndex, disabled, isOpen]);

  function openOptions(): void {
    const optionIndex = selectedOptionIndex < 0 ? 0 : selectedOptionIndex;
    setActiveOptionIndex(optionIndex);
    setIsOpen(true);
  }

  function choose(characterId: string | null): void {
    if (disabled) {
      setIsOpen(false);
      return;
    }
    onSelect(characterId);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleOptionsKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    const lastOptionIndex = options.length;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveOptionIndex((index) => Math.min(index + 1, lastOptionIndex));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveOptionIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveOptionIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveOptionIndex(lastOptionIndex);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  }

  return (
    <div className="character-dropdown">
      <span className="form-field-label" id={`${fieldId}-label`}>
        {label}
      </span>
      <button
        aria-controls={`${fieldId}-options`}
        aria-expanded={isOpen && !disabled}
        aria-haspopup="listbox"
        aria-labelledby={`${fieldId}-label ${fieldId}-value`}
        className="character-dropdown-trigger"
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : openOptions())}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
          } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openOptions();
          }
        }}
        ref={triggerRef}
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
          {isOpen && !disabled ? "⌃" : "⌄"}
        </span>
      </button>
      {isOpen && !disabled ? (
        <div
          aria-labelledby={`${fieldId}-label`}
          className="character-dropdown-options"
          id={`${fieldId}-options`}
          onKeyDown={handleOptionsKeyDown}
          role="listbox"
        >
          <button
            aria-selected={selectedId === null}
            className="character-dropdown-option character-dropdown-empty"
            onClick={() => choose(null)}
            onFocus={() => setActiveOptionIndex(0)}
            role="option"
            ref={(element) => {
              optionRefs.current[0] = element;
            }}
            type="button"
          >
            Ninguno
          </button>
          {options.map((character, index) => (
            <button
              aria-selected={selectedId === character.id}
              className="character-dropdown-option"
              key={character.id}
              onClick={() => choose(character.id)}
              onFocus={() => setActiveOptionIndex(index + 1)}
              role="option"
              ref={(element) => {
                optionRefs.current[index + 1] = element;
              }}
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
