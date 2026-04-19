#!/bin/bash

set -e

EC2_HOST="ec2-98-90-200-105.compute-1.amazonaws.com"
EC2_USER="ec2-user"
PEM_KEY="C:/Users/admin/Documents/toolloop-backend-server-keys.pem"
REMOTE_DIR="/home/ec2-user/toolloop"
SERVICE_NAME="toolloop"
BINARY_NAME="toolloopapi-1.0.0-SNAPSHOT-runner"
JAVA17_HOME="C:/Program Files/java/jdk-17.0.2"

SSH_OPTS="-i \"$PEM_KEY\" -o StrictHostKeyChecking=no"

ssh_run() {
    ssh -i "$PEM_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "$@"
}

scp_run() {
    scp -i "$PEM_KEY" -o StrictHostKeyChecking=no "$@"
}

echo ""
echo "======================================"
echo "  Despliegue Nativo ToolLoop"
echo "======================================"

# 1. Cambiar a Java 17 para la compilación
echo ""
echo "[1/4] Cambiando a Java 17 para la compilación..."
ORIGINAL_JAVA_HOME="$JAVA_HOME"
ORIGINAL_PATH="$PATH"
export JAVA_HOME="$JAVA17_HOME"
export PATH="$JAVA_HOME/bin:$PATH"
java -version
echo "JAVA_HOME configurado temporalmente en: $JAVA_HOME"

# 2. Compilar imagen nativa
echo ""
echo "[2/4] Compilando imagen nativa..."
mvn clean package -Pnative -DskipTests

# Restaurar versión de Java original
export JAVA_HOME="$ORIGINAL_JAVA_HOME"
export PATH="$ORIGINAL_PATH"
echo "Java restaurado a su versión original."

BINARY_PATH="target/$BINARY_NAME"
if [[ ! -f "$BINARY_PATH" ]]; then
    echo "ERROR: Binario no encontrado en $BINARY_PATH"
    exit 1
fi
echo "Binario encontrado: $BINARY_PATH ($(du -sh "$BINARY_PATH" | cut -f1))"

# 3. Subir binario
echo ""
echo "[3/4] Subiendo binario a la EC2..."
ssh_run "mkdir -p $REMOTE_DIR"
scp_run "$BINARY_PATH" "$EC2_USER@$EC2_HOST:$REMOTE_DIR/$BINARY_NAME"
ssh_run "chmod +x $REMOTE_DIR/$BINARY_NAME"
echo "Subida completada."

# 4. Escribir archivo de servicio localmente, subirlo e instalar vía sudo
echo ""
echo "[4/4] Instalando servicio systemd y reiniciando..."

SERVICE_FILE="/tmp/toolloop-deploy.service"
cat > "$SERVICE_FILE" << SERVICE
[Unit]
Description=ToolLoop Quarkus Native
After=network.target

[Service]
Type=simple
User=$EC2_USER
WorkingDirectory=$REMOTE_DIR
ExecStart=$REMOTE_DIR/$BINARY_NAME
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

[Install]
WantedBy=multi-user.target
SERVICE

# Subir archivo de servicio, mover a carpeta de sistema y activar
scp_run "$SERVICE_FILE" "$EC2_USER@$EC2_HOST:/tmp/$SERVICE_NAME.service"
ssh_run "/usr/bin/sudo cp /tmp/$SERVICE_NAME.service /etc/systemd/system/$SERVICE_NAME.service"
ssh_run "/usr/bin/sudo systemctl daemon-reload"
ssh_run "/usr/bin/sudo systemctl enable $SERVICE_NAME"
ssh_run "/usr/bin/sudo systemctl restart $SERVICE_NAME"

sleep 3
echo ""
echo "======================================"
echo "  Estado del servicio:"
echo "======================================"
ssh_run "/usr/bin/sudo systemctl status $SERVICE_NAME --no-pager -l" || true

echo ""
echo "Despliegue completado"
echo ""
echo "Comandos útiles (ejecutar vía SSH en la EC2):"
echo "  Logs:    sudo journalctl -u $SERVICE_NAME -f"
echo "  Parar:   sudo systemctl stop $SERVICE_NAME"
echo "  Reiniciar: sudo systemctl restart $SERVICE_NAME"
echo "  Estado:  sudo systemctl status $SERVICE_NAME"