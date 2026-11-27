"use client";

import { useState } from "react";
import Image from "next/image";
import type { PlayerProfile } from "@/modules/players";
import { CharacterDropdown } from "./character-dropdown";

interface ProfileFormProps {
  readonly initialProfile: PlayerProfile;
}

export function ProfileForm({ initialProfile }: ProfileFormProps): React.JSX.Element {
  const [gamertag, setGamertag] = useState(initialProfile.gamertag ?? "");
  const [firstName, setFirstName] = useState(initialProfile.firstName ?? "");
  const [lastName, setLastName] = useState(initialProfile.lastName ?? "");
  const [twitter, setTwitter] = useState(initialProfile.twitter ?? "");
  const [twitch, setTwitch] = useState(initialProfile.twitch ?? "");
  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl);
  const [primaryCharacterId, setPrimaryCharacterId] = useState<string | null>(
    initialProfile.characters.find(({ isMain }) => isMain)?.id ?? null,
  );
  const [secondaryCharacterId, setSecondaryCharacterId] = useState<string | null>(
    initialProfile.characters.find(({ isMain }) => !isMain)?.id ?? null,
  );
  const [message, setMessage] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (file === undefined) return;
    setMessage(undefined);
    setSaved(false);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/players/me", {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: file,
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const serverMessage =
          typeof result === "object" &&
          result !== null &&
          "message" in result &&
          typeof result.message === "string"
            ? result.message
            : "No se pudo guardar la foto.";
        setMessage(serverMessage);
        return;
      }
      if (
        typeof result === "object" &&
        result !== null &&
        "avatarUrl" in result &&
        typeof result.avatarUrl === "string"
      ) {
        setAvatarUrl(result.avatarUrl);
        setSaved(true);
      }
    } catch {
      setMessage("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
      input.value = "";
    }
  }

  function updatePrimaryCharacter(characterId: string | null): void {
    setPrimaryCharacterId(characterId);
    if (characterId === null || characterId === secondaryCharacterId) {
      setSecondaryCharacterId(null);
    }
    setSaved(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage(undefined);
    setSaved(false);
    setIsSubmitting(true);
    const characters = [
      ...(primaryCharacterId === null ? [] : [{ id: primaryCharacterId, isMain: true }]),
      ...(secondaryCharacterId === null ? [] : [{ id: secondaryCharacterId, isMain: false }]),
    ];

    try {
      const response = await fetch("/api/players/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gamertag, firstName, lastName, twitter, twitch, bio, characters }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const serverMessage =
          typeof result === "object" &&
          result !== null &&
          "message" in result &&
          typeof result.message === "string"
            ? result.message
            : "No se pudo guardar la ficha.";
        setMessage(serverMessage);
        return;
      }
      setSaved(true);
    } catch {
      setMessage("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <label className="form-field">
        Foto de perfil (JPEG, PNG o WebP; máximo 2 MB)
        {avatarUrl === null ? null : (
          <Image alt="" height={96} src={avatarUrl} unoptimized width={96} />
        )}
        <input
          accept="image/jpeg,image/png,image/webp"
          disabled={isSubmitting}
          onChange={handleAvatarChange}
          type="file"
        />
      </label>
      <div className="profile-form-fields">
        <label className="form-field">
          Nick
          <input
            autoComplete="nickname"
            disabled={isSubmitting}
            maxLength={64}
            onChange={(event) => {
              setGamertag(event.currentTarget.value);
              setSaved(false);
            }}
            required
            value={gamertag}
          />
        </label>
        <div className="profile-name-fields">
          <label className="form-field">
            Nombre
            <input
              autoComplete="given-name"
              disabled={isSubmitting}
              maxLength={80}
              onChange={(event) => {
                setFirstName(event.currentTarget.value);
                setSaved(false);
              }}
              required
              value={firstName}
            />
          </label>
          <label className="form-field">
            Apellidos
            <input
              autoComplete="family-name"
              disabled={isSubmitting}
              maxLength={80}
              onChange={(event) => {
                setLastName(event.currentTarget.value);
                setSaved(false);
              }}
              required
              value={lastName}
            />
          </label>
        </div>
        <div className="profile-social-fields">
          <label className="form-field">
            Twitter / X
            <input
              autoComplete="off"
              disabled={isSubmitting}
              maxLength={64}
              onChange={(event) => {
                setTwitter(event.currentTarget.value);
                setSaved(false);
              }}
              placeholder="@usuario"
              value={twitter}
            />
          </label>
          <label className="form-field">
            Twitch
            <input
              autoComplete="off"
              disabled={isSubmitting}
              maxLength={64}
              onChange={(event) => {
                setTwitch(event.currentTarget.value);
                setSaved(false);
              }}
              placeholder="@usuario"
              value={twitch}
            />
          </label>
        </div>
        <label className="form-field">
          Biografía <span className="field-hint">{bio.length}/500</span>
          <textarea
            disabled={isSubmitting}
            maxLength={500}
            onChange={(event) => {
              setBio(event.currentTarget.value);
              setSaved(false);
            }}
            rows={5}
            value={bio}
          />
        </label>
      </div>

      <fieldset className="character-picker">
        <legend>Personajes</legend>
        <p className="auth-description">
          Elige tu personaje principal y, si quieres, uno secundario.
        </p>
        <div className="character-dropdown-grid">
          <CharacterDropdown
            disabled={isSubmitting}
            fieldId="main-character"
            label="Personaje principal"
            onSelect={updatePrimaryCharacter}
            selectedId={primaryCharacterId}
          />
          <CharacterDropdown
            disabled={isSubmitting || primaryCharacterId === null}
            excludedId={primaryCharacterId}
            fieldId="secondary-character"
            label="Personaje secundario"
            onSelect={(characterId) => {
              setSecondaryCharacterId(characterId);
              setSaved(false);
            }}
            selectedId={secondaryCharacterId}
          />
        </div>
      </fieldset>

      {message === undefined ? null : (
        <p className="form-message" role="alert">
          {message}
        </p>
      )}
      {saved ? (
        <p className="form-message form-message-success" role="status">
          Ficha guardada.
        </p>
      ) : null}
      <button className="button button-primary" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Guardando…" : "Guardar ficha"}
      </button>
    </form>
  );
}
