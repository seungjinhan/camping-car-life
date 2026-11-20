import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { useApp } from "../state";

interface Pin {
  id: string;
  lat: number;
  lng: number;
  title: string;
}

interface KakaoMapInstance {
  setBounds: (bounds: unknown) => void;
  setCenter: (point: unknown) => void;
}

interface KakaoMaps {
  load: (callback: () => void) => void;
  LatLng: new (lat: number, lng: number) => unknown;
  LatLngBounds: new () => { extend: (point: unknown) => void };
  Map: new (element: HTMLElement, options: { center: unknown; level: number }) => KakaoMapInstance;
  Marker: new (options: { map: unknown; position: unknown; title: string }) => { setMap: (map: unknown) => void };
  event: { addListener: (target: unknown, type: string, handler: (event: { latLng: { getLat: () => number; getLng: () => number } }) => void) => void };
  services: { Geocoder: new () => { addressSearch: (query: string, callback: (result: { x: string; y: string }[], status: string) => void) => void }; Status: { OK: string } };
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps };
  }
}

const KEY = import.meta.env.VITE_KAKAO_APP_KEY as string | undefined;
let loading: Promise<KakaoMaps> | null = null;

/** 지도를 못 불러온 단계예요. 관리자 화면에 보여줘서 토스 앱 안에서도 원인을 알 수 있게 해요. */
export class MapLoadError extends Error {}

function loadSdk(): Promise<KakaoMaps> {
  loading ??= new Promise<KakaoMaps>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(KEY ?? "")}&libraries=services&autoload=false`;
    const timer = setTimeout(() => reject(new MapLoadError("load-timeout")), 10000);
    script.onload = () => {
      if (!window.kakao?.maps) {
        clearTimeout(timer);
        return reject(new MapLoadError("no-kakao-object"));
      }
      window.kakao.maps.load(() => {
        clearTimeout(timer);
        resolve(window.kakao!.maps);
      });
    };
    script.onerror = () => {
      clearTimeout(timer);
      reject(new MapLoadError("script-error (401 도메인 불일치 · 차단 · 네트워크)"));
    };
    document.head.append(script);
  }).catch((error: unknown) => {
    loading = null; // 다음에 다시 시도할 수 있게 해요.
    throw error;
  });
  return loading;
}

/** 국내 장소만 보여줘요. 키가 없으면 자리표시를 보여줘요. */
/** 주소를 좌표로 바꿔요 (등록할 때 한 번만, 결과는 쌓아 두지 않아요). */
export async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!KEY || !address.trim()) return null;
  const maps = await loadSdk();
  return new Promise((resolve) => {
    new maps.services.Geocoder().addressSearch(address, (result, status) => {
      resolve(status === maps.services.Status.OK && result[0] ? { lat: Number(result[0].y), lng: Number(result[0].x) } : null);
    });
  });
}

export const hasMapKey = Boolean(KEY);

export function KakaoMap({ pins, height, onPin, onPick }: { pins: Pin[]; height: number; onPin?: (id: string) => void; onPick?: (lat: number, lng: number) => void }) {
  const { t } = useI18n();
  const { isAdmin } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [reason, setReason] = useState("");
  // 지도는 한 번만 만들고, 핀이 바뀌면 핀만 바꿔요. 부모가 다시 그려져도(토스트 등) 사용자가 옮긴 지도는 그대로예요.
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const markersRef = useRef<{ setMap: (map: unknown) => void }[]>([]);
  const onPinRef = useRef(onPin);
  onPinRef.current = onPin;
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const pinsKey = JSON.stringify(pins);
  const picking = Boolean(onPick);

  useEffect(() => {
    const list = JSON.parse(pinsKey) as Pin[];
    if (!KEY || !ref.current) return;
    if (list.length === 0 && !picking && !mapRef.current) return;
    let cancelled = false;
    loadSdk()
      .then((maps) => {
        if (cancelled || !ref.current) return;
        if (!mapRef.current) {
          const center = list[0] ?? { lat: 36.5, lng: 127.8 };
          const created = new maps.Map(ref.current, { center: new maps.LatLng(center.lat, center.lng), level: list[0] ? 9 : 13 });
          mapRef.current = created;
          // 위치 고르기: 지도를 누른 곳이 새 핀이 돼요 (부모가 pins로 다시 넘겨줘요).
          if (picking) maps.event.addListener(created, "click", (event) => onPickRef.current?.(event.latLng.getLat(), event.latLng.getLng()));
        }
        const map = mapRef.current;
        for (const marker of markersRef.current) marker.setMap(null);
        const bounds = new maps.LatLngBounds();
        markersRef.current = list.map((pin) => {
          const position = new maps.LatLng(pin.lat, pin.lng);
          bounds.extend(position);
          const marker = new maps.Marker({ map, position, title: pin.title });
          maps.event.addListener(marker, "click", () => onPinRef.current?.(pin.id));
          return marker;
        });
        if (list.length > 1) map.setBounds(bounds);
        else if (list.length === 1) map.setCenter(new maps.LatLng(list[0].lat, list[0].lng));
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setFailed(true);
        setReason(error instanceof Error ? error.message : String(error));
      });
    return () => {
      cancelled = true;
    };
  }, [pinsKey, picking]);

  if (!KEY || failed) {
    return (
      <div className="map-placeholder" style={{ height }}>
        <span>{failed ? t("지도를 불러오지 못했어요") : t("카카오맵 (키를 넣으면 보여요)")}</span>
        {failed && isAdmin && <small className="map-reason">{reason} · {location.origin}</small>}
      </div>
    );
  }
  return <div ref={ref} className="map" style={{ height }} />;
}
