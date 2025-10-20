const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Primero limpiar la base de datos existente
  await prisma.project.deleteMany();

  const projects = [
    {
      nombre: "Sistema de Gestión de Proyectos",
      descripcion: "Desarrollo de una plataforma fullstack para gestión de proyectos con React, Node.js y PostgreSQL.",
      estado: "EN_PROGRESO",
      fechaInicio: new Date("2024-01-15"),
      fechaFin: new Date("2024-06-30")
    },
    {
      nombre: "App Móvil de Delivery",
      descripcion: "Desarrollo de una aplicación móvil para servicio de delivery con React Native y Node.js.",
      estado: "PENDIENTE",
      fechaInicio: new Date("2024-02-01"),
      fechaFin: null
    },
    {
      nombre: "Portal de Noticias",
      descripcion: "Creación de un portal de noticias con contenido dinámico y sistema de comentarios.",
      estado: "FINALIZADO",
      fechaInicio: new Date("2024-01-01"),
      fechaFin: new Date("2024-01-10")
    },
    {
      nombre: "Sistema de Gestión Interna",
      descripcion: "Sistema interno para la gestión de empleados y recursos de la empresa.",
      estado: "CANCELADO",
      fechaInicio: new Date("2024-01-05"),
      fechaFin: null
    }
  ];

  for (const projectData of projects) {
    await prisma.project.create({
      data: projectData
    });
  }

  console.log('✅ Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });