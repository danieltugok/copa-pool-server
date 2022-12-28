import { FastifyInstance } from 'fastify';
import ShortUniqueId from 'short-unique-id';
import { prisma } from '../lib/prisma'
import {z} from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function poolRoutes(fastify: FastifyInstance, ) {
  fastify.get('/pools/count', async (request, reply) => {
    const count = await prisma.pool.count();
    return { count }
  })

  fastify.post('/pools', async (request, reply) => {
    const createPoolBody = z.object({
      title: z.string(),
    });

    const { title } = createPoolBody.parse(request.body);

    const generate = new ShortUniqueId({ length: 6 })
    const code = String(generate()).toUpperCase();



    await prisma.pool.create({
      data: {
        title,
        code
      }
    })
    // const pool = await prisma.pool.create({
    //   data: {
    //     title,
    //     code,
    //     ownerId,
    //   }
    // })

    return reply.status(201).send({ title });
  })

  //

  fastify.get('/pools/', 
  // { onRequest: [authenticate]},
   async (request, reply) => {
    const pools = await prisma.pool.findMany();
    console.log("🚀 ~ file: pool.ts:48 ~ pools", pools)
  })
}