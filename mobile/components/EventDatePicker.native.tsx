
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  mode: "date" | "time";
  value: Date;
  onChange: (date: Date) => void;
};

export default function EventDatePicker({ mode, value, onChange }: Props) {
  const [ouvert, setOuvert] = useState(false);

  const label = mode === "date"
    ? value.toLocaleDateString("fr-FR")
    : value.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <View>
      <TouchableOpacity
        onPress={() => setOuvert(true)}
        style={{
          backgroundColor: "#1E1E1E",
          borderColor: "#333",
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
        }}
      >
        <Text style={{ color: "#FFF" }}>
          {mode === "date" ? "📅" : "🕒"} {label}
        </Text>
      </TouchableOpacity>

      {ouvert && (
        <DateTimePicker
          value={value}
          mode={mode}
          is24Hour
          display="default"
          minimumDate={mode === "date" ? new Date() : undefined}
          onChange={(event, selectedDate) => {
            if (Platform.OS === "android") setOuvert(false);

            if (event.type === "set" && selectedDate) {
              onChange(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
}
