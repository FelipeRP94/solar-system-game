"use client";

import dynamic from "next/dynamic";

const SpaceMapScene = dynamic(
  () => import("@/scenes/SpaceMapScene").then((module) => module.SpaceMapScene),
  {
    ssr: false,
    loading: () => (
      <main className="space-map scene-loading" aria-busy="true">
        <span className="eyebrow">INITIALIZING ORBITAL FIELD</span>
      </main>
    ),
  },
);

const PlayPage = () => {
  return <SpaceMapScene />;
};

export default PlayPage;
