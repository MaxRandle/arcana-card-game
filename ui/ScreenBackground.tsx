import Image from "next/image";
import background from "@/assets/backgrounds/victorian-cobblestone.png";

// Full-bleed background plate every screen sits on top of. Rendered once in the
// root layout and fixed to the viewport, so it stays mounted across route
// changes instead of reloading on each navigation.
export function ScreenBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Image
        src={background}
        alt=""
        aria-hidden
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
