import { findName, useApp } from "../state";
import { useI18n } from "../i18n";
import { Chips } from "./ui";

export interface Region {
  country: string;
  province: string;
  city: string;
}

export const ALL = "all";
export const ANY_REGION: Region = { country: ALL, province: ALL, city: ALL };

export function matchesRegion(item: { country: string; province: string; city: string }, region: Region): boolean {
  return (region.country === ALL || item.country === region.country) && (region.province === ALL || item.province === region.province) && (region.city === ALL || item.city === region.city);
}

/** 내용이 있는 지역만 칩으로 보여줘요. 국가 줄은 내용 있는 국가가 2개 이상일 때만 나와요.
 * 지금 고른 도 · 시군은 다른 필터 때문에 내용이 없어져도 칩을 남겨서, 무엇으로 걸러지는지 보이게 해요. */
export function RegionFilter({ items, value, onChange, requireProvince = false }: { items: { country: string; province: string; city: string }[]; value: Region; onChange: (next: Region) => void; requireProvince?: boolean }) {
  const { t, l } = useI18n();
  const { dictionary } = useApp().snapshot;
  const countries = dictionary.countries.filter((country) => items.some((item) => item.country === country.key));
  const inCountry = items.filter((item) => value.country === ALL || item.country === value.country);
  const provinces = dictionary.provinces.filter((province) => province.key === value.province || inCountry.some((item) => item.province === province.key));
  const province = dictionary.provinces.find((item) => item.key === value.province);
  const cities = province ? province.cities.filter((city) => city.key === value.city || inCountry.some((item) => item.province === province.key && item.city === city.key)) : [];

  return (
    <>
      {countries.length >= 2 && (
        <Chips label={t("국가")} selected={value.country} onSelect={(country) => onChange({ country, province: ALL, city: ALL })} items={[{ key: ALL, label: t("전체") }, ...countries.map((item) => ({ key: item.key, label: l(item.name) }))]} />
      )}
      <Chips label={t("도")} selected={value.province} onSelect={(next) => onChange({ ...value, province: next, city: ALL })} items={[...(requireProvince ? [] : [{ key: ALL, label: t("전체") }]), ...provinces.map((item) => ({ key: item.key, label: l(findName(dictionary.provinces, item.key)) }))]} />
      {province && cities.length > 0 && (
        <Chips label={t("시군")} selected={value.city} onSelect={(city) => onChange({ ...value, city })} items={[{ key: ALL, label: t("전체 시군") }, ...cities.map((item) => ({ key: item.key, label: l(item.name) }))]} />
      )}
    </>
  );
}

export function useRegionName() {
  const { l } = useI18n();
  const { dictionary } = useApp().snapshot;
  return (item: { province: string; city: string }) => {
    const province = dictionary.provinces.find((p) => p.key === item.province);
    const city = province?.cities.find((c) => c.key === item.city);
    return [l(province?.name), l(city?.name)].filter(Boolean).join(" ");
  };
}
