import { useEffect, useState } from "react";
import InputBase from "./inputBase";

type Props = {
  value?: string;
  onChange?: (v: string) => void;
};

export default function PhoneInput({ value, onChange }: Props) {
  const [phone, setPhone] = useState(value ?? "");

  useEffect(() => {
    if (typeof value === "string" && value !== phone) setPhone(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length === 0) return "";

    if (digits.length <= 2) {
      return `(${digits}`;
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
  };

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^\d]/g, "");
    const formatted = formatPhone(cleaned);
    if (onChange) onChange(formatted);
    else setPhone(formatted);
  };

  return (
    <InputBase
      placeholder="Telefone"
      keyboardType="phone-pad"
      inputMode="numeric"
      value={value ?? phone}
      onChangeText={handleChange}
      iconLeft="telefone"
      maxLength={15}
    />
  );
}
