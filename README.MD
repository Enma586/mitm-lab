# Laboratorio MITM

Laboratorio reproducible para demostrar un ataque Man-in-the-Middle de forma
controlada. Las 3 VMs, la red interna y el software se levantan con un solo
comando desde este repositorio.

> Alcance de este entregable: infraestructura, apps, puente de eventos en
> vivo, escenario de ataque y dashboard, todo completo.

## Arquitectura

```
VirtualBox (red interna aislada 192.168.56.0/24)
|
+-- Ubuntu Client   (192.168.56.10)  - VICTIMA
|     Docker -> frontend React (nginx, puerto 80, HTTP sin TLS)
|
+-- Ubuntu Server   (192.168.56.20)  - SERVIDOR
|     Docker -> backend Express hexagonal (puerto 4000, HTTP sin TLS)
|
+-- Kali Linux      (192.168.56.30)  - ATACANTE
      arpspoof, Wireshark, mitmproxy, tcpdump
```

La app es intencionalmente vulnerable: el login viaja por HTTP plano para que
el trafico pueda interceptarse. No usar credenciales reales en el laboratorio.

## Almacenamiento de las VMs

Todo el disco y el estado de las maquinas virtuales vive en `D:\VM`, no en
`C:`. Esto ya quedo configurado en este equipo:

- `VBoxManage setproperty machinefolder "D:\VM\VirtualBox VMs"` -> ahi se
  crean los discos .vdi de cada VM.
- Variable de entorno `VAGRANT_HOME=D:\VM\.vagrant.d` -> ahi se descargan las
  cajas (boxes) de Vagrant (`ubuntu/jammy64`, `kalilinux/rolling`), que pesan
  varios GB.

Si abres una terminal nueva en otra maquina del equipo, hay que repetir esos
dos pasos antes de correr `vagrant up` (o exportar `VAGRANT_HOME` a mano).

## Prerrequisitos

En este equipo ya estan instalados:

```
vboxmanage --version
vagrant --version
```

No hace falta instalar Ansible en Windows: el `Vagrantfile` usa el
provisioner `ansible_local`, que instala y corre Ansible **dentro** de cada
VM Linux.

## Como levantar el laboratorio

```
cd mitm-lab
vagrant up
```

Esto crea las 3 VMs y ejecuta automaticamente:

- `ansible/server.yml` en `server` -> instala Docker, construye y levanta el
  backend (puerto 4000).
- `ansible/client.yml` en `client` -> instala Docker, construye y levanta el
  frontend (puerto 80).
- `ansible/kali.yml` en `kali` -> instala arpspoof, Wireshark, mitmproxy,
  tcpdump y habilita el reenvio de paquetes.

Todo eso (instalar Ansible, `apt update`, Docker, `docker build`) pasa
**solo la primera vez** que se crea cada VM. Una vez creadas, prender y
apagar es rapido y no vuelve a reprovisionar nada.

Para entrar a cada una:

```
vagrant ssh client
vagrant ssh server
vagrant ssh kali
```

### Uso diario (VMs ya creadas)

| Comando | Que hace |
|---|---|
| `vagrant up` | Prende las 3 (segundos/minutos, sin reinstalar nada) |
| `vagrant halt` | Apaga limpio, el disco queda tal cual |
| `vagrant suspend` / `vagrant resume` | Pausa guardando el estado de RAM en disco (mas rapido que halt/up) |
| `vagrant status` | Muestra el estado de las 3 sin tocarlas |
| `vagrant reload` | Reinicia una VM (como reboot), sin reinstalar nada |
| `vagrant provision` | Vuelve a correr el playbook de Ansible sin recrear la VM (usar si cambias codigo en `server/`, `client/` o los `.yml`) |
| `vagrant destroy -f` | Borra la VM entera. La siguiente `vagrant up` vuelve a ser "primera vez" |

Los contenedores Docker (`mitm-server`, `mitm-client`) se levantan con
`--restart unless-stopped`, asi que con solo prender la VM (`vagrant up`
o `vagrant resume`) Docker los vuelve a levantar solo.

Snapshot de cada VM ya configurada (mas rapido que reprovisionar si algo
se rompe probando el ataque):

```
vagrant snapshot save server server-listo
vagrant snapshot save client client-listo
vagrant snapshot save kali kali-listo

# para volver al punto guardado:
vagrant snapshot restore server server-listo
```

## Verificacion

- `vagrant up` levanta las 3 VMs sin errores.
- Desde tu navegador (o desde `client`): `http://192.168.56.10` abre la app.
- Desde `client`: `curl http://192.168.56.20:4000/health` responde
  `{"status":"ok"}`.
- Desde `kali`: `ping 192.168.56.10` y `ping 192.168.56.20` responden.

## Escenario de ataque

1. Desde el navegador entra a `http://192.168.56.10` y haz login con el
   usuario de prueba: `victima` / `password123`.
2. Desde `kali`:
   ```
   vagrant ssh kali
   sudo /vagrant/scripts/start-attack.sh
   ```
   Esto arranca `arpspoof` en ambas direcciones entre `client` y `server`, y
   captura el trafico con `tcpdump` (`.pcap`) y con `mitmdump` (HTTP ya
   decodificado) en `~/captures`.
3. Repite el login desde el navegador mientras el ataque corre.
4. Abre la captura:
   - `wireshark ~/captures/captura-<fecha>.pcap` (filtro sugerido: `http`)
   - `mitmproxy -r ~/captures/http-<fecha>.flow`
5. Deberias ver el POST a `/api/login` con `username` y `password` en texto
   plano, y el token devuelto, que tambien viaja sin cifrar.

Para detener el ataque: `Ctrl+C` en la sesion donde corre el script (limpia
el ARP spoofing automaticamente).

## Dashboard en vivo

El dashboard corre en tu propia maquina (no dentro de una VM), y se conecta
por HTTP/WebSocket al backend en `192.168.56.20:4000`:

```
cd dashboard
npm install
npm run dev
```

Abre `http://localhost:5174`. Ya viene configurado para apuntar al backend
del laboratorio por defecto (variables `VITE_API_BASE_URL` / `VITE_WS_URL`
si necesitas apuntar a otro lado). Mientras el ataque de la seccion anterior
corre, el dashboard va mostrando cada credencial/token interceptado en vivo.

## Estructura del repositorio

```
mitm-lab/
├── Vagrantfile              # 3 VMs, IPs fijas, RAM/CPU, provisioner ansible_local
├── ansible/
│   ├── inventory.ini        # inventario de referencia (no lo usa "vagrant up")
│   ├── server.yml           # instala Docker + levanta el backend
│   ├── client.yml           # instala Docker + levanta el frontend
│   └── kali.yml             # instala herramientas de ataque
├── server/                  # backend Express, arquitectura hexagonal
│   └── src/
│       ├── domain/          # entidades y puertos (interfaces)
│       ├── application/     # casos de uso (LoginUseCase, GetProfileUseCase)
│       └── infrastructure/  # adaptadores: Express, repos en memoria, hashing
├── client/                  # frontend React + TypeScript (Vite)
│   └── src/
│       ├── components/      # UI reutilizable (Button, TextField, Card...)
│       ├── features/        # auth/, profile/ (logica de cada pantalla)
│       ├── services/        # AuthService, ProfileService (interfaces + HTTP)
│       ├── context/         # AuthContext (estado global de sesion)
│       └── pages/           # LoginPage, HomePage
├── dashboard/                # dashboard en vivo (React + TypeScript), corre en el host
│   └── src/
│       ├── domain/          # tipo AttackEvent + selectors.ts (funciones puras)
│       ├── services/        # EventsService (REST) y RealtimeEventSource (WebSocket)
│       ├── components/ui/   # Card, LineChart, RadialGauge, etc. - todo propio, sin librerias
│       └── features/        # Resumen, Hosts, Distribucion, Exposicion, Hallazgos
└── scripts/
    ├── start-attack.sh      # arpspoof + iptables + mitmproxy transparente, para correr en Kali
    └── mitm_bridge.py       # addon de mitmproxy: manda lo interceptado a POST /api/events
```

## Notas de diseno del backend (hexagonal)

- `domain/` no importa Express ni ninguna libreria externa: solo entidades e
  interfaces (`UserRepository`, `PasswordHasher`, `TokenService`).
- `application/` contiene los casos de uso, que dependen solo de esas
  interfaces (inversion de dependencias).
- `infrastructure/` implementa las interfaces (repositorio en memoria,
  hashing con SHA-256, tokens opacos) y expone todo por HTTP con Express.
- `src/main.ts` es el composition root: el unico lugar donde se conectan las
  implementaciones concretas con los casos de uso.

## Notas de diseno del frontend (SOLID + componentes reutilizables)

- `components/ui/` son componentes puros sin logica de negocio (Button,
  TextField, Card, AlertBanner), usables en cualquier pantalla futura.
- `services/` define interfaces (`AuthService`, `ProfileService`) y una
  implementacion HTTP concreta; los componentes dependen de la interfaz, no
  de `fetch` directamente.
- `App.tsx` es el composition root: arma `FetchHttpClient` ->
  `HttpAuthService` / `HttpProfileService` -> `AuthProvider`, y ese es el
  unico lugar que sabria si un dia hay que cambiar de backend.

## Solucion de problemas

**`vagrant up` se queda pegado en "Waiting for machine to boot" y termina en
timeout**, en una maquina Windows con Hyper-V/WSL2/Docker Desktop instalado:

VirtualBox le pierde el VT-x a Hyper-V y cae a su motor de compatibilidad
(NEM, que usa la API de Hyper-V de Windows por debajo). En ese modo, el NIC
`e1000` emulado por defecto se puede colgar apenas arranca la red, y el
guest sigue esperando un hypervisor tipo KVM cuando en realidad hay Hyper-V
debajo. El `Vagrantfile` ya trae el arreglo (NIC `virtio` + `paravirtprovider
hyperv` + `boot_timeout` mas alto), pero si algun dia vuelve a pasar:

1. Confirmalo mirando el log: `D:\VM\VirtualBox VMs\<vm>\Logs\VBox.log`,
   buscando la linea `VT-x is not available`.
2. Si con eso no alcanza, la opcion definitiva (mas invasiva) es liberar el
   VT-x desactivando Hyper-V del todo: `bcdedit /set hypervisorlaunchtype
   off` + reiniciar Windows (esto tambien apaga WSL2/Docker Desktop hasta
   que se reactive con `bcdedit /set hypervisorlaunchtype auto` + reiniciar
   de nuevo).

**El dashboard no recibe eventos en vivo**: confirma que el backend este
arriba (`curl http://192.168.56.20:4000/health`) y que no haya un firewall
bloqueando el puerto 4000 entre tu maquina y la red `192.168.56.0/24`.
