import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma'
import {z} from 'zod';
import { authenticate } from '../plugins/authenticate';
import fetch from "node-fetch"

export async function authRoutes(fastify: FastifyInstance, ) {

  fastify.get('/me', {
    onRequest: [authenticate]
  },
  async (request, reply) => {
    await request.jwtVerify()

    return { user: request.user }
  })


  fastify.post('/users', async (request, reply) => {

    const createUserBody = z.object({
      access_token: z.string(),
    });

    const { access_token } = createUserBody.parse(request.body);
    console.log("🚀 ~ file: auth.ts:13 ~ fastify.post ~ access_token", access_token)

    try {
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })      
      const userData = await userResponse.json();
      console.log("🚀 ~ file: auth.ts:21 ~ fastify.post ~ userResponse", userData)
      return {  userData }
      
    } catch (error) {
      console.log("🚀 ~ file: auth.ts:21 ~ fastify.post ~ userResponse", error)     
    }



    const userInfoSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    })

    const userInfo = userInfoSchema.parse(userData);

     // const user = await prisma.user.create({
    //   data: {
    //     email,
    //     password,
    //   },
    // })

    let user = await prisma.user.findUnique({
      where: {
        googleID: userInfo.id,
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleID: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          avatarUrl: userInfo.picture,
        }
      })
    } 

    const token = fastify.jwt.sign({ 
      name: user.name, 
      avatarUrl: user.avatarUrl
    }, {
      sub: user.id,
      expiresIn: '1h',
    })



   
    return { token }
    // return { userInfo }
  })
  
}