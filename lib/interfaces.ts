export const INTERFACES = [
  {
    id: "cobalt",
    name: "Cobalt Play",
    layout: "keypad",
    character: null,
    dark: true,
  },
  {
    id: "friendly",
    name: "Friendly Focus",
    layout: "focus",
    character: "/art/companion-violet.webp",
    dark: false,
  },
  {
    id: "studio",
    name: "Studio Blue",
    layout: "keypad",
    character: "/art/companion-blue.webp",
    dark: false,
  },
  {
    id: "golden",
    name: "Golden Companion",
    layout: "input-first",
    character: "/art/companion-gold.webp",
    dark: false,
  },
  {
    id: "midnight",
    name: "Midnight Focus",
    layout: "focus",
    character: null,
    dark: true,
  },
  {
    id: "evergreen",
    name: "Evergreen Studio",
    layout: "focus",
    character: null,
    dark: true,
  },
] as const;
export type InterfaceId = (typeof INTERFACES)[number]["id"];
export const INTERFACE_STORAGE_KEY = "king:v2:interface";
export function isInterface(value: unknown): value is InterfaceId {
  return (
    typeof value === "string" && INTERFACES.some((item) => item.id === value)
  );
}
export function getInterface(id: InterfaceId) {
  return INTERFACES.find((item) => item.id === id)!;
}
// Apply before paint; the validated browser preference never changes game state.
export const interfaceBootstrap = `try{var t=localStorage.getItem('${INTERFACE_STORAGE_KEY}');if(${JSON.stringify(INTERFACES.map((t) => t.id))}.includes(t)){document.documentElement.dataset.interface=t;}}catch(e){}`;
