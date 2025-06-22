# 8BitDo-keyboard

1. /etc/systemd/systemd/setupkeyboard.service

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
