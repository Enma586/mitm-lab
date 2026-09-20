# -*- mode: ruby -*-
# vi: set ft=ruby :
#
# Laboratorio MITM: 3 VMs sobre una red interna aislada (192.168.56.0/24).
#   server  (192.168.56.20) - backend Express (arquitectura hexagonal), HTTP sin TLS a proposito.
#   client  (192.168.56.10) - frontend de la app "victima".
#   kali    (192.168.56.30) - maquina atacante con arpspoof, wireshark, mitmproxy.
#
# Todo el estado de VirtualBox y las cajas de Vagrant se guardan en D:\VM
# (ver README.md, seccion "Almacenamiento de las VMs").
#
# Provisioner: ansible_local -> Ansible corre DENTRO de cada VM, asi que no hace
# falta instalarlo en el host Windows.

VM_NETWORK = "192.168.56"

Vagrant.configure("2") do |config|
  config.vm.box_check_update = false

  # ---------------------------------------------------------------------
  # SERVER - backend Express (hexagonal), expone la API por HTTP en :4000
  # ---------------------------------------------------------------------
  config.vm.define "server" do |server|
    server.vm.box = "ubuntu/jammy64"
    server.vm.hostname = "mitm-server"
    server.vm.network "private_network", ip: "#{VM_NETWORK}.20"

    server.vm.provider "virtualbox" do |vb|
      vb.name = "mitm-lab-server"
      vb.memory = 2048
      vb.cpus = 2
    end

    server.vm.provision "ansible_local" do |ansible|
      ansible.playbook = "ansible/server.yml"
      ansible.provisioning_path = "/vagrant"
      ansible.install_mode = "pip"
    end
  end

  # ---------------------------------------------------------------------
  # CLIENT - frontend "victima", consume la API del server por HTTP
  # ---------------------------------------------------------------------
  config.vm.define "client" do |client|
    client.vm.box = "ubuntu/jammy64"
    client.vm.hostname = "mitm-client"
    client.vm.network "private_network", ip: "#{VM_NETWORK}.10"

    client.vm.provider "virtualbox" do |vb|
      vb.name = "mitm-lab-client"
      vb.memory = 1536
      vb.cpus = 1
    end

    client.vm.provision "ansible_local" do |ansible|
      ansible.playbook = "ansible/client.yml"
      ansible.provisioning_path = "/vagrant"
      ansible.install_mode = "pip"
    end
  end

  # ---------------------------------------------------------------------
  # KALI - maquina atacante, herramientas nativas (sin Docker)
  # ---------------------------------------------------------------------
  config.vm.define "kali" do |kali|
    kali.vm.box = "kalilinux/rolling"
    kali.vm.hostname = "mitm-kali"
    kali.vm.network "private_network", ip: "#{VM_NETWORK}.30"

    kali.vm.provider "virtualbox" do |vb|
      vb.name = "mitm-lab-kali"
      vb.memory = 2048
      vb.cpus = 2
      # Kali trae escritorio; para el ataque por consola no hace falta,
      # pero se deja headless off por si se quiere abrir la GUI de Wireshark.
      vb.gui = false
    end

    kali.vm.provision "ansible_local" do |ansible|
      ansible.playbook = "ansible/kali.yml"
      ansible.provisioning_path = "/vagrant"
      ansible.install_mode = "pip"
    end
  end
end
