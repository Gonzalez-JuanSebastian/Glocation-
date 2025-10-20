FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat \
    python3 \
    make \
    g++

# Copiar archivos de dependencias PRIMERO (para cache de Docker)
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (incluyendo devDependencies)
RUN npm install

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar el resto del código fuente
COPY . .

# Crear directorio para logs si no existe
RUN mkdir -p logs

# Exponer puerto
EXPOSE 3001

# Comando de inicio mejorado
CMD ["sh", "-c", "npx prisma generate && npm run dev"]