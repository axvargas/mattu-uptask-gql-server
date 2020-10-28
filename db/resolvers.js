const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

require('dotenv').config({ path: 'variables.env' })

const User = require('../models/User')
const Project = require('../models/Project')
const Task = require('../models/Task')
const generateToken = async (user, secret, expiresIn) => {
    const { id, name, email } = user
    const payload = {
        id,
        name,
        email
    }
    return jwt.sign(payload, secret, { expiresIn })
}

// * RESOLVERS
const resolvers = {

    Query: {
        getAuthenticatedUser: (_, { }, ctx) => {
            console.log(ctx);
            return ctx.user
        },

        getProjects: async (_, { }, ctx) => {
            const { user } = ctx
            try {
                const projects = await Project.find({ creator: user.id })
                return projects
            } catch (error) {
                throw new Error(error.message)
            }
        },

        getTasksByProject: async (_, { projectId }, ctx) => {
            const { user } = ctx
            try {
                const tasks = await Task.find({ creator: user.id }).where('project').equals(projectId)
                return tasks
            } catch (error) {
                throw new Error(error.message)
            }
        }
    },

    Mutation: {
        createUser: async (_, { input }) => {
            try {
                const { name, email, password } = input
                const userExists = await User.findOne({ email })
                if (userExists) throw new Error("The user already exist")

                const salt = bcryptjs.genSaltSync(10)
                input.password = bcryptjs.hashSync(password, salt)

                const newUser = new User(input)
                const response = await newUser.save()
                return response

            } catch (error) {
                throw new Error(error.message)
            }
        },
        authenticateUser: async (_, { input }) => {
            try {
                const { email, password } = input
                const user = await User.findOne({ email })
                if (!user) throw new Error("The user does not exist")

                const checkPassword = bcryptjs.compareSync(password, user.password)
                if (!checkPassword) {
                    throw new Error('The password is not correct')
                }

                return {
                    token: generateToken(user, process.env.SECRET, '24h')
                }

            } catch (error) {
                throw new Error(error.message)
            }
        },

        createProject: async (_, { input }, ctx) => {
            const { user } = ctx
            try {
                const project = new Project(input)
                project.creator = user.id
                const response = await project.save()
                return response
            } catch (error) {
                throw new Error(error.message)
            }
        },
        updateProject: async (_, { id, input }, ctx) => {
            const { user } = ctx
            try {
                let project = await Project.findById(id)
                if (!project) throw new Error("The project does not exist")

                if (project.creator.toString() !== user.id) throw new Error("You are not authorized to modify this project")

                project = await Project.findOneAndUpdate({ _id: id }, input, { new: true })
                return project

            } catch (error) {
                throw new Error(error.message)
            }
        },
        deleteProject: async (_, { id }, ctx) => {
            try {
                const project = await Project.findById(id)
                if (!project) {
                    throw new Error("The project does not exist")
                }
                await Project.findOneAndDelete({ _id: id })
                return "Project successfully deleted"
            } catch (error) {
                throw new Error(error.message)
            }
        },

        createTask: async (_, { input }, ctx) => {
            const { user } = ctx
            try {
                const task = new Task(input)
                task.creator = user.id
                const response = await task.save()
                return response
            } catch (error) {
                throw new Error(error.message)
            }
        },
        updateTask: async (_, { id, input, status }, ctx) => {
            const { user } = ctx
            try {
                let task = await Task.findById(id)
                if (!task) throw new Error("The task does not exist")

                if (task.creator.toString() !== user.id) throw new Error("You are not authorized to modify this task")

                input.status = status

                task = await Task.findOneAndUpdate({ _id: id }, input, { new: true })
                return task
            } catch (error) {
                throw new Error(error.message)
            }
        },
        deleteTask: async (_, { id }, ctx) => {
            const { user } = ctx
            try {
                let task = await Task.findById(id)
                if (!task) throw new Error("The task does not exist")

                if (task.creator.toString() !== user.id) throw new Error("You are not authorized to modify this task")

                await Task.findOneAndDelete({ _id: id })
                return "Task successfully deleted"
            } catch (error) {
                throw new Error(error.message)
            }
        }
    }
}

module.exports = resolvers