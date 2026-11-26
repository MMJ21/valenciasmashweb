import type { NextConfig } from "next";

if (process.env.NODE_ENV === "development") {
  void import("@opennextjs/cloudflare")
    .then(({ initOpenNextCloudflareForDev }) =>
      initOpenNextCloudflareForDev({ persist: true, remoteBindings: false }),
    )
    .catch((error: unknown) => {
      console.error("No se pudieron inicializar los bindings locales de Cloudflare.", error);
    });
}

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
