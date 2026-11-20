import { useI18n } from "../i18n";
import { Field, Select } from "./form";
import type { useRegionPicker } from "./useRegionPicker";

export function RegionFields({ picker }: { picker: ReturnType<typeof useRegionPicker> }) {
  const { t } = useI18n();
  return (
    <div className="grid3">
      <Field label={t("국가")}><Select value={picker.value.country} onChange={picker.setCountry} options={picker.countryOptions} /></Field>
      <Field label={t("도")}><Select value={picker.value.province} onChange={picker.setProvince} options={picker.provinceOptions} /></Field>
      <Field label={t("시군")}><Select value={picker.value.city} onChange={picker.setCity} options={picker.cityOptions} /></Field>
    </div>
  );
}
