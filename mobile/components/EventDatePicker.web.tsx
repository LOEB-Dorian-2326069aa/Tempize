
import React from "react";

type Props = {
  mode: "date" | "time";
  value: Date;
  onChange: (date: Date) => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function EventDatePicker({ mode, value, onChange }: Props) {
  const dateValue =
    `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;

  const timeValue = `${pad(value.getHours())}:${pad(value.getMinutes())}`;

  return (
    <input
      type={mode}
      value={mode === "date" ? dateValue : timeValue}
      min={mode === "date"
        ? new Date().toLocaleDateString("sv-SE")
        : undefined}
      onChange={(event) => {
        const nouvelleDate = new Date(value);

        if (mode === "date") {
          const [annee, mois, jour] =
            event.target.value.split("-").map(Number);

          if (!annee || !mois || !jour) return;
          nouvelleDate.setFullYear(annee, mois - 1, jour);
        } else {
          const [heures, minutes] =
            event.target.value.split(":").map(Number);

          if (!Number.isFinite(heures) || !Number.isFinite(minutes)) return;
          nouvelleDate.setHours(heures, minutes, 0, 0);
        }

        onChange(nouvelleDate);
      }}
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: 15,
        borderRadius: 12,
        border: "1px solid #333",
        backgroundColor: "#1E1E1E",
        color: "#FFF",
        colorScheme: "dark",
        fontSize: 15,
      }}
    />
  );
}
