const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDateEU(value: string | Date) {
  return dateFormatter.format(new Date(value));
}

export function formatDateTimeEU(value: string | Date) {
  return dateTimeFormatter.format(new Date(value));
}
