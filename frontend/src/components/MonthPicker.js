import React from "react";
import useTranslation from "next-translate/useTranslation";

const MonthPicker = ({ selectedMonth, handleMonthChange }) => {
  const { t } = useTranslation("monthPicker");

  return (
    <select value={selectedMonth} onChange={handleMonthChange}>
      <option value="">{t("monthPickerSelect")}</option>
      <option value="01">{t("monthPicker01")}</option>
      <option value="02">{t("monthPicker02")}</option>
      <option value="03">{t("monthPicker03")}</option>
      <option value="04">{t("monthPicker04")}</option>
      <option value="05">{t("monthPicker05")}</option>
      <option value="06">{t("monthPicker06")}</option>
      <option value="07">{t("monthPicker07")}</option>
      <option value="08">{t("monthPicker08")}</option>
      <option value="09">{t("monthPicker09")}</option>
      <option value="10">{t("monthPicker10")}</option>
      <option value="11">{t("monthPicker11")}</option>
      <option value="12">{t("monthPicker12")}</option>
    </select>
  );
};

export default MonthPicker;
