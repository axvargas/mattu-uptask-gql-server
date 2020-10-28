const { gql } = require('apollo-server')
// * SCHEMA
const typeDefs = gql`
        
    type User {
        id: ID
        name: String
        email: String
        createdAt: String
    }

    type Project {
        id: ID
        name: String
        creator: ID
        createdAt: String
    }
    type Task {
        id: ID
        name: String
        project: ID
        status: Boolean
        creator: ID
        createdAt: String
    }


    type Token {
        token: String
    }

    input UserInput {
        name: String!
        email: String!
        password: String!
    }
    input ProjectInput {
        name: String!
    }
    input TaskInput {
        name: String!
        project: ID
    }

    input AuthenticateUserInput {
        email: String!
        password: String!
    }

    type Query {
        # Users
        getAuthenticatedUser: User

        # Projects
        getProjects: [Project]

        # Task
        getTasksByProject(projectId: ID!): [Task]
    }
    type Mutation {
        # Users
        createUser(input: UserInput): User
        authenticateUser(input: AuthenticateUserInput): Token
        
        # Projects
        createProject(input: ProjectInput): Project
        updateProject(id: ID!, input: ProjectInput): Project
        deleteProject(id: ID!): String

        # Tasks
        createTask(input: TaskInput): Task
        updateTask(id: ID!, input: TaskInput, status: Boolean): Task
        deleteTask(id: ID!): String
    }
`

module.exports = typeDefs