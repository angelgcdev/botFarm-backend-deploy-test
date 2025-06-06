/* eslint-disable */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testQuery() {
  try {
    // Aquí va tu consulta SQL para probar
    const items = ['TIKTOK', 'FACEBOOK'];
    // 1. Insertar cuenta_google
    const socialNetwork = await prisma.social_network.findMany({
      where: {
        name: {
          in: items,
        },
      },
    });

    console.log(socialNetwork);
  } catch (error) {
    console.error('Error ejecutando la consulta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();

// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// async function testCuentaGoogleQuery() {
//   try {
//     const user_id = 1;

//     const userScheduledTiktokInteractions =
//       await prisma.scheduled_tiktok_interaction.findMany({
//         where: {
//           device_scheduled_tiktok_interactions: {
//             some: {
//               device: {
//                 user_id,
//               },
//             },
//           },
//         },
//       });

//     console.log(
//       'Resultado:',
//       JSON.stringify(userScheduledTiktokInteractions, null, 2),
//     );
//   } catch (error) {
//     console.error('Error ejecutando la consulta:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// testCuentaGoogleQuery();
