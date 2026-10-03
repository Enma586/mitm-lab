import { SelectHTMLAttributes } from "react";
import "./TextField.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: SelectOption[];
}

/**
 * Hermano de TextField para listas cerradas de opciones (ej. elegir
 * cuenta de origen/destino en TransferForm). Reusa el mismo CSS
 * (text-field / text-field__label / text-field__input) para que ambos
 * formularios se vean consistentes sin duplicar estilos.
 */
export function SelectField({ label, id, options, ...rest }: SelectFieldProps) {
  return (
    <div className="text-field">
      <label htmlFor={id} className="text-field__label">
        {label}
      </label>
      <select id={id} className="text-field__input" {...rest}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
