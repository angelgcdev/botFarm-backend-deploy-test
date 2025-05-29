// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function testQuery() {
//   try {
//     // Aquí va tu consulta SQL para probar
//     const result = await prisma.$queryRaw`
//       SELECT
//   cg.*,
//   crs.*,
//   rs.*
// FROM
//   cuenta_google cg
// LEFT JOIN
//   cuenta_red_social crs ON crs.cuenta_google_id = cg.id
// LEFT JOIN
//   red_social rs ON rs.id = crs.red_social_id
// WHERE
//   cg.dispositivo_id = 15
// LIMIT 1
//       `;
//     console.log(result);
//   } catch (error) {
//     console.error('Error ejecutando la consulta:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// testQuery();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCuentaGoogleQuery() {
  try {
    const user_id = 1;

    const userScheduledTiktokInteractions =
      await prisma.scheduled_tiktok_interaction.findMany({
        where: {
          device_scheduled_tiktok_interactions: {
            some: {
              device: {
                user_id,
              },
            },
          },
        },
      });

    console.log(
      'Resultado:',
      JSON.stringify(userScheduledTiktokInteractions, null, 2),
    );
  } catch (error) {
    console.error('Error ejecutando la consulta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCuentaGoogleQuery();
