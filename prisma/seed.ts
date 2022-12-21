import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient();


async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe1@gmail.com',
      avatarUrl: 'https://github.com/danieltugok.png',
    },
  })

  const pool = await prisma.pool.create({
    data: {
      title: 'Example Pool1',
      code: 'Bol1231',
      ownerId: user.id,

      // Will create seed in participants as well
      participants: {
        create: {
          userId: user.id
        }
      }
    }
  })
  
  // const participant = await prisma.participant.create({
  //   data: {
  //     poolId: pool.id,
  //     userId: user.id
  //   },
  // })

  await prisma.game.create({
    data: {
      date: '2022-12-30T18:00:00.570Z',
      fisrtTeamCountryCode: 'DE',
      secondTeamCountryCode: 'BR',
    }
  })

  await prisma.game.create({
    data: {
      date: '2023-01-03T12:00:00.570Z',
      fisrtTeamCountryCode: 'BR',
      secondTeamCountryCode: 'AR',

      guesses: {
        create: {
          firstTeamScore: 2,
          secondTeamScore: 1,

          participant: {
            connect: {
              userId_poolId: {
                userId: user.id,
                poolId: pool.id
              }
            }
          }
        }
      }
    }
  })







}

main()