import { InputHTMLAttributes } from "react";
import "./TextField.css";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

/**
 * Input con etiqueta, reutilizable en cualquier formulario del front.
 */
export function TextField({ label, id, ...rest }: TextFieldProps) {
  return (
    <div className="text-field">
      <label htmlFor={id} className="text-field__label">
        {label}
      </label>
      <input id={id} className="text-field__input" {...rest} />
    </div>
  );
}
