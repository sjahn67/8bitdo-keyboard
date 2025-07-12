# 8BitDo-keyboard
1. In config.txt in Micro-SD card

[all]
#Make enable OTG and keyboard
dtoverlay=dwc2,dr_mode=peripheral


2. /etc/modules
---------------------------------------------------------------------------
# /etc/modules: kernel modules to load at boot time.
#
# This file contains the names of kernel modules that should be loaded
# at boot time, one per line. Lines beginning with "#" are ignored.
# Parameters can be specified after the module name.

dwc2
g_hid
---------------------------------------------------------------------------

3. /etc/systemd/system/setupkeyboard.service
---------------------------------------------------------------------------
[Unit]
Description=Raspi 2W as a usb keyboard.
After=muti-user.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/sjahn/8bitdo-keyboard
ExecStart=/bin/bash /home/sjahn/8bitdo-keyboard/usb_keyboard_setup.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
---------------------------------------------------------------------------
- activation
    sudo systemctl enable setupkeyboard.service
- start
    sudo systemctl start setupkeyboard.service
- confirm status
    sudo systemctl status setupkeyboard.service
---------------------------------------------------------------------------

4. /etc/systemd/system/8bitdo-keyboard.service
---------------------------------------------------------------------------
[Unit]
Description=8bitdo-keyboard program
After=setupkeyboard.service

[Service]
Type=simple
User=root
WorkingDirectory=/home/sjahn/8bitdo-keyboard
ExecStart=/home/sjahn/8bitdo-keyboard/8BitDo-keyboard-server
Restart=on-failure

[Install]
WantedBy=multi-user.target
---------------------------------------------------------------------------
- activation
    sudo systemctl enable 8bitdo-keyboard.service
- start
    sudo systemctl start 8bitdo-keyboard.service
- confirm status
    sudo systemctl status 8bitdo-keyboard.service
---------------------------------------------------------------------------
