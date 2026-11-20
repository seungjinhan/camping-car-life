import { useState } from "react";
import { useI18n } from "../i18n";
import { useApp } from "../state";

/** 관리자 폼의 국가 → 도 → 시군 연동 선택이에요. */
export function useRegionPicker(initial?: { country: string; province: string; city: string }) {
  const { l } = useI18n();
  const { dictionary } = useApp().snapshot;
  const firstCountry = initial?.country ?? dictionary.countries[0]?.key ?? "kr";
  const provincesOf = (country: string) => dictionary.provinces.filter((item) => item.country === country);
  const firstProvince = initial?.province ?? provincesOf(firstCountry)[0]?.key ?? "";
  const citiesOf = (province: string) => dictionary.provinces.find((item) => item.key === province)?.cities ?? [];
  const [country, setCountry] = useState(firstCountry);
  const [province, setProvince] = useState(firstProvince);
  const [city, setCity] = useState(initial?.city ?? citiesOf(firstProvince)[0]?.key ?? "");

  return {
    value: { country, province, city },
    countryOptions: dictionary.countries.map((item) => ({ key: item.key, label: l(item.name) })),
    provinceOptions: provincesOf(country).map((item) => ({ key: item.key, label: l(item.name) })),
    cityOptions: citiesOf(province).map((item) => ({ key: item.key, label: l(item.name) })),
    setCountry: (next: string) => {
      setCountry(next);
      const p = provincesOf(next)[0]?.key ?? "";
      setProvince(p);
      setCity(citiesOf(p)[0]?.key ?? "");
    },
    setProvince: (next: string) => {
      setProvince(next);
      setCity(citiesOf(next)[0]?.key ?? "");
    },
    setCity,
  };
}
