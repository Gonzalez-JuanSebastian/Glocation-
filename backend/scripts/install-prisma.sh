#!/bin/sh

# Instalar engines de Prisma manualmente
npm install @prisma/engines@latest

# Forzar la instalación binary
export PRISMA_CLI_QUERY_ENGINE_TYPE=binary
export PRISMA_CLIENT_ENGINE_TYPE=binary

# Generar cliente
npx prisma generate