import { VARIABLE_LABEL_OVERRIDES } from "../constants.js";

export const formatLabel = (value) => {
  if (!value) return "—";
  const raw = value.toString().replace(/_/g, " ").trim();
  return raw
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
};

export const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const absValue = Math.abs(value);
  if (absValue >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (absValue >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (absValue >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (absValue >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

export const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const absValue = Math.abs(value);
  if (absValue >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (absValue >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (absValue >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (absValue >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export const roundForDisplay = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const absValue = Math.abs(value);
  if (absValue >= 1e6) {
    return Math.round(value / 1e6) * 1e6;
  }
  return value;
};

export const formatNumberRounded = (value) => formatNumber(roundForDisplay(value));
export const formatCurrencyRounded = (value) => formatCurrency(roundForDisplay(value));

export const getVariableLabel = (datasetKey, variableKey) => {
  if (!variableKey) return "—";
  return VARIABLE_LABEL_OVERRIDES[datasetKey]?.[variableKey] || formatLabel(variableKey);
};

export const toTitleCase = (value) => {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
};
