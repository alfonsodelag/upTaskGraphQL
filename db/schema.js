const { gql } = require("apollo-server");

// ** Las queries son las que obtendran los datos, como un SELECT o un get
// ** Los resolvers son funciones que se conetaran con tus type definitions
// ! GraphQL SÓLO te devuelve lo que le pides
// ! Estamos diciendo, titulo será un String, por eso se llama typedefinitions
// ! Le ponemos brackets a Curso (o sea [Curso]) para que nos retorne MÚLTIPLES cursos

const typeDefs = gql`               
type Token {
    token: String
}

type Proyecto {
    nombre: String,
    id: ID
}

type Tarea {
    nombre: String,
    id: ID,
    proyecto: String
    estado: Boolean 
}

type Query {
    obtenerProyectos: [Proyecto]

    obtenerTareas(input: ProyectoIDInput): [Tarea]
}

input UsuarioInput {
    nombre: String!
    email: String!
    password: String!
}

input ProyectoIDInput {
    proyecto: String!
}

input AutenticarInput {
    email: String!
    password: String!
}

input ProyectoInput {
    nombre: String!
}

input TareaInput {
    nombre: String!
    proyecto: String!
}

type Mutation {
    # Proyectos
    crearUsuario(input: UsuarioInput): String
    autenticarUsuario(input: AutenticarInput) : Token
    nuevoProyecto(input: ProyectoInput) : Proyecto
    actualizarProyecto(id: ID!, input: ProyectoInput): Proyecto
    eliminarProyecto(id: ID!) : String

    #Tareas
    nuevaTarea(input: TareaInput) : Tarea
    actualizarTarea(id: ID!, input: TareaInput, estado: Boolean) : Tarea 
    eliminarTarea(id: ID!): String
}`;

module.exports = typeDefs;