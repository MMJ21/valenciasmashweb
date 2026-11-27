import { createElement } from "react";

interface PlayerBioProps {
  readonly bio: string;
}

export function PlayerBio({ bio }: PlayerBioProps): React.JSX.Element {
  return createElement("p", { className: "profile-bio" }, bio);
}
