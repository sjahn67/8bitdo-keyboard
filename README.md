# 8BitDo-keyboard

2. /etc/modules
---------------------------------------------------------------------------
# /etc/modules: kernel modules to load at boot time.
#
# This file contains the names of kernel modules that should be loaded
# at boot time, one per line. Lines beginning with "#" are ignored.
# Parameters can be specified after the module name.

i2c-dev
dwc2
g_hid
---------------------------------------------------------------------------

3. /etc/systemd/systemd/setupkeyboard.service
---------------------------------------------------------------------------
[Unit]
Description=My Custom Script Service
After=muti-user.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/sjahn
ExecStart=/bin/bash /home/sjahn/usb_keyboard_setup.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
---------------------------------------------------------------------------
