import Image from "next/image";
import background from "@/assets/backgrounds/victorian-cobblestone.png";

// Full-bleed background plate that the non-combat screens sit on top of.
export function ScreenBackground() {
  return (
    <Image
      src={background}
      alt=""
      aria-hidden
      fill
      priority
      placeholder="blur"
      sizes="100vw"
      className="-z-10 object-cover"
    />
  );
}
