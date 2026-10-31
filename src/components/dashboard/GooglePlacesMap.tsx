import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

type Position = { lat: number; lng: number };
interface MapInstance { setCenter: (position: Position) => void }
interface MarkerInstance { setMap: (map: MapInstance | null) => void; addListener: (event: string, handler: () => void) => { remove: () => void } }
interface MapsApi {
  Map: new (element: HTMLElement, options: { center: Position; zoom: number; clickableIcons: boolean; mapTypeControl: boolean; streetViewControl: boolean }) => MapInstance;
  Marker: new (options: { position: Position; map: MapInstance; title: string; label: string }) => MarkerInstance;
}
declare global { interface Window { google?: { maps?: MapsApi }; initPataCertaMap?: () => void; gm_authFailure?: () => void } }
export interface MapPlace { name: string; position: Position }
let mapsPromise: Promise<MapsApi> | undefined;

function loadMaps(key: string): Promise<MapsApi> {
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const fail = () => { script.remove(); mapsPromise = undefined; reject(new Error("Google Maps indisponível")); };
    window.initPataCertaMap = () => {
      const api = window.google?.maps;
      if (!api?.Map) { fail(); return; }
      resolve(api);
      delete window.initPataCertaMap;
    };
    window.gm_authFailure = fail;
    const params = new URLSearchParams({ key, loading: "async", callback: "initPataCertaMap", language: "pt-PT", region: "PT", channel: import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] || "gmp_lovable_agentskills_v1" });
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return mapsPromise;
}

export function GooglePlacesMap<T extends MapPlace>({ list, onSelect }: { list: T[]; onSelect: (place: T) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapInstance | null>(null);
  const select = useRef(onSelect);
  select.current = onSelect;
  const [error, setError] = useState(false);
  const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
  useEffect(() => {
    if (!key) return;
    let active = true;
    const markers: MarkerInstance[] = [];
    const listeners: { remove: () => void }[] = [];
    loadMaps(key).then((api) => {
      if (!active || !container.current) return;
      if (!map.current) map.current = new api.Map(container.current, { center: { lat: 38.7223, lng: -9.1393 }, zoom: 12, clickableIcons: false, mapTypeControl: false, streetViewControl: false });
      list.forEach((place) => {
        const currentMap = map.current;
        if (!currentMap) return;
        const marker = new api.Marker({ position: place.position, map: currentMap, title: place.name, label: String(list.indexOf(place) + 1) });
        markers.push(marker);
        listeners.push(marker.addListener("click", () => select.current(place)));
      });
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; listeners.forEach((listener) => listener.remove()); markers.forEach((marker) => marker.setMap(null)); };
  }, [key, list]);
  return <div className="relative h-80 overflow-hidden rounded-2xl border border-border bg-secondary sm:h-[460px]">
    <div ref={container} className="h-full w-full" aria-label="Google Maps — locais em Lisboa" />
    {(!key || error) && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"><MapPin className="h-9 w-9 text-accent-deep" /><p className="font-serif text-xl">Locais em Lisboa</p><p role="status" className="max-w-sm text-sm text-muted-foreground">{error ? "Não foi possível carregar o Google Maps. Os locais continuam disponíveis abaixo." : "Google Maps por configurar. Os locais estão disponíveis abaixo."}</p></div>}
  </div>;
}
