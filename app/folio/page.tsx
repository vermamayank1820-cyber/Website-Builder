import { FolioNav } from "./_components/FolioNav";
import { SceneHero } from "./_components/SceneHero";
import { SceneManifesto } from "./_components/SceneManifesto";
import { SceneWork } from "./_components/SceneWork";
import { SceneApproach } from "./_components/SceneApproach";
import { SceneWriting } from "./_components/SceneWriting";
import { SceneContact } from "./_components/SceneContact";

export default function FolioPage() {
  return (
    <>
      <FolioNav />
      <main>
        <SceneHero />
        <SceneManifesto />
        <SceneWork />
        <SceneApproach />
        <SceneWriting />
        <SceneContact />
      </main>
    </>
  );
}
