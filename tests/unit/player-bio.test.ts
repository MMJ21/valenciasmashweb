import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlayerBio } from "@/app/components/players/player-bio";

describe("REQ-202: biografía como texto plano", () => {
  it("escapa etiquetas en vez de interpretarlas como HTML", () => {
    const markup = renderToStaticMarkup(
      createElement(PlayerBio, { bio: '<script>alert("x")</script> <b>texto</b>' }),
    );

    expect(markup).toContain("&lt;script&gt;");
    expect(markup).toContain("&lt;b&gt;texto&lt;/b&gt;");
    expect(markup).not.toContain("<script>");
    expect(markup).not.toContain("<b>");
  });
});
