import { useEffect, useState } from "react";
import { Alert } from "react-native";
import InputBase from "./inputBase";

type Props = {
  value?: string;
  onChange?: (v: string) => void;
};

export default function BirthDateInput({ value, onChange }: Props) {
  const [birthDate, setBirthDate] = useState(value ?? "");

  useEffect(() => {
    if (typeof value === "string" && value !== birthDate) {
      setBirthDate(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const formatDate = (val: string) => {
    const digits = val.replace(/\D/g, "");
    let formatted = digits;

    if (digits.length > 2 && digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }

    return formatted;
  };

  const validateAge = (dateString: string) => {
    const [day, month, year] = dateString.split("/").map(Number);
    if (!day || !month || !year) return false;

    const today = new Date();
    const birth = new Date(year, month - 1, day);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 12;
  };

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^\d]/g, "");
    const formatted = formatDate(cleaned);
    if (onChange) onChange(formatted);
    else setBirthDate(formatted);
  };

  const handleBlur = () => {
    const current = value ?? birthDate;
    if (current.length === 10 && !validateAge(current)) {
      Alert.alert("Idade inválida", "Você precisa ter pelo menos 12 anos.");
      if (onChange) onChange("");
      else setBirthDate("");
    }
  };

  return (
    <InputBase
      placeholder="Data de nascimento"
      keyboardType="phone-pad"
      inputMode="numeric"
      value={value ?? birthDate}
      onChangeText={handleChange}
      onBlur={handleBlur}
      maxLength={10}
      iconLeft="data"
    />
  );
}
