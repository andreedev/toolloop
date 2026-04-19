#!/bin/bash

set -e

EC2_HOST="ec2-98-90-200-105.compute-1.amazonaws.com"
EC2_USER="ec2-user"
PEM_KEY="C:/Users/admin/Documents/toolloop-backend-server-keys.pem"
REMOTE_DIR="/home/ec2-user/toolloop"
SERVICE_NAME="toolloop"
BINARY_NAME="toolloopapi-1.0.0-SNAPSHOT-runner"
JAVA17_HOME="C:/Program Files/java/jdk-17.0.2"

ssh_run() {
    ssh -i "$PEM_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "$@"
}

scp_run() {
    scp -i "$PEM_KEY" -o StrictHostKeyChecking=no "$@"
}

echo ""
echo "======================================"
echo "  ToolLoop Redespliegue"
echo "======================================"

# 1. Compilar con Java 17
echo ""
echo "[1/3] Compilando imagen nativa (Java 17)..."
ORIGINAL_JAVA_HOME="$JAVA_HOME"
ORIGINAL_PATH="$PATH"
export JAVA_HOME="$JAVA17_HOME"
export PATH="$JAVA_HOME/bin:$PATH"

mvn clean package -Pnative -DskipTests

export JAVA_HOME="$ORIGINAL_JAVA_HOME"
export PATH="$ORIGINAL_PATH"

BINARY_PATH="target/$BINARY_NAME"
if [[ ! -f "$BINARY_PATH" ]]; then
    echo "ERROR: Binario no encontrado en $BINARY_PATH"
    exit 1
fi
echo "Binario listo: $(du -sh "$BINARY_PATH" | cut -f1)"

# 2. Detener servicio, subir nuevo binario, reiniciar
echo ""
echo "[2/3] Deteniendo el servicio..."
ssh_run "/usr/bin/sudo systemctl stop $SERVICE_NAME"

echo "Subiendo nuevo binario..."
scp_run "$BINARY_PATH" "$EC2_USER@$EC2_HOST:$REMOTE_DIR/$BINARY_NAME"
ssh_run "chmod +x $REMOTE_DIR/$BINARY_NAME"

echo ""
echo "[3/3] Reiniciando el servicio..."
ssh_run "/usr/bin/sudo systemctl restart $SERVICE_NAME"

sleep 3
echo ""
echo "======================================"
echo "  Estado del servicio:"
echo "======================================"
ssh_run "/usr/bin/sudo systemctl status $SERVICE_NAME --no-pager -l" || true

echo ""
echo "Redespliegue completado"