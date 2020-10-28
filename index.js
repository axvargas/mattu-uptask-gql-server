const { ApolloServer } = require('apollo-server')

const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' })

const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')
const connectDB = require('./config/db')

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const token = req.headers['authorization'] || ''
        if (token) {
            try {
                const user = jwt.verify(token.replace('Bearer ', ''), process.env.SECRET)
                return {
                    user
                }
            } catch (error) {
                console.log(error)
                if (error.message === 'invalid token') {
                    throw new Error("Invalid token")
                }
                throw new Error("No authorization, your session might have expired")
            }
        } else {
            console.log("No Token");
        }
    }
})

connectDB()

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`Server running on ${url}`)
})