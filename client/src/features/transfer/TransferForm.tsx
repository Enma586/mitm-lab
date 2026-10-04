import { FormEvent, useState } from "react";
import { Button } from "../../components/ui/Button";
import { SelectField } from "../../components/ui/SelectField";
import { TextField } from "../../components/ui/TextField";
import { AlertBanner } from "../../components/ui/AlertBanner";
import { ApiError } from "../../services/httpClient";
import { TransferResult, TransferService } from "../../services/TransferService";

interface TransferFormProps {
  transferService: TransferService;
}

// Mismas dos cuentas de prueba que crea el backend en memoria
// (server/src/infrastructure/repositories/InMemoryAccountRepository.ts).
const ACCOUNTS = [
  { value: "acc-alice", label: "acc-alice (alice)" },
  { value: "acc-bob", label: "acc-bob (bob)" },
];

/**
 * Reemplaza el `curl -X POST /api/transfer` manual de
 * ejemplo/escenario-transferencias.md: ahora la "victima" dispara la
 * transferencia desde la UI real del cliente, igual que ya hace con el
 * login (LoginForm). El request sigue viajando por HTTP plano, asi que
 * Kali lo intercepta igual (ver scripts/mitm_bridge.py), pero ya no
 * hace falta simularlo a mano desde una terminal.
 */
export function TransferForm({ transferService }: TransferFormProps) {
  const [fromAccountId, setFromAccountId] = useState(ACCOUNTS[0].value);
  const [toAccountId, setToAccountId] = useState(ACCOUNTS[1].value);
  const [amount, setAmount] = useState("100");
  const [result, setResult] = useState<TransferResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    setIsSubmitting(true);
    try {
      const response = await transferService.transfer({
        fromAccountId,
        toAccountId,
        amount: Number(amount),
      });
      setResult(response);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo conectar con el servidor";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="transfer-form" onSubmit={handleSubmit}>
      <h3>Transferir fondos</h3>

      <div className="transfer-form__row">
        <SelectField
          id="fromAccountId"
          label="Desde"
          options={ACCOUNTS}
          value={fromAccountId}
          onChange={(e) => setFromAccountId(e.target.value)}
        />
        <SelectField
          id="toAccountId"
          label="Hacia"
          options={ACCOUNTS}
          value={toAccountId}
          onChange={(e) => setToAccountId(e.target.value)}
        />
      </div>

      <TextField
        id="amount"
        label="Monto"
        type="number"
        min={1}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      {error && <AlertBanner variant="error">{error}</AlertBanner>}
      {result && (
        <AlertBanner variant="success">
          {`Transferencia enviada: ${result.fromAccountId} -> ${result.toAccountId} ($${result.amount}). ` +
            `Saldos: ${result.fromAccountId}=${result.fromBalance}, ${result.toAccountId}=${result.toBalance}.`}
        </AlertBanner>
      )}

      <Button type="submit" disabled={isSubmitting || fromAccountId === toAccountId}>
        {isSubmitting ? "Enviando..." : "Enviar transferencia"}
      </Button>
    </form>
  );
}
