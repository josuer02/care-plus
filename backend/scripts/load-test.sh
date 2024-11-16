#!/bin/bash

# Configuración de las pruebas de carga
DURATION=30
CONNECTIONS=100
PIPELINING=10
BASE_URL="http://localhost:3001"

# Colores para mejor legibilidad
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función principal de pruebas
test_gets() {
    echo -e "${GREEN}Iniciando pruebas de carga para endpoints GET...${NC}\n"
    
    # Array de endpoints a probar
    endpoints=(
        "/api/appointments"
        "/api/doctors/available-slots?doctorId=1&date=2024-10-28"
        "/api/patients"
        "/api/doctors"
        "/api/health"
    )

    # Prueba cada endpoint
    for endpoint in "${endpoints[@]}"; do
        echo -e "${BLUE}Testing GET: ${BASE_URL}${endpoint}${NC}"
        echo "Duración: ${DURATION}s | Conexiones: ${CONNECTIONS} | Pipelining: ${PIPELINING}"
        echo "----------------------------------------"
        
        autocannon -c $CONNECTIONS -d $DURATION -p $PIPELINING "${BASE_URL}${endpoint}"
        
        echo -e "\nEsperando 2 segundos antes de la siguiente prueba...\n"
        sleep 2
    done
}

# Iniciar las pruebas
echo -e "${GREEN}Pruebas de Rendimiento - Load Testing GET Endpoints${NC}"
echo "----------------------------------------"
test_gets