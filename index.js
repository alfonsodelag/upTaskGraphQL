// GraphQL es un lenguaje de consulta y manipulación de datos para APIs, y un entorno de ejecución para realizar consultas con datos existentes.1​ GraphQL fue desarrollado internamente por Facebook en 2012 antes de ser liberado públicamente en 2015
const { ApolloServer } = require("apollo-server");
const jwt = require("jsonwebtoken");
require("dotenv").config("variables.env");
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");

const conectarDB = require("./config/db");

// Conectar a la BD
conectarDB();

// ** Todos los servers de Apollo necesitan un Schema, que sirve para darle estructura a los datos. Usualmente se usa creando una variable
// ** llamada type definitions

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const token = req.headers['authorization'] || "";
        if (token) {
            try {
                const usuario = jwt.verify(token, process.env.SECRETA);
                console.log(usuario);

                return {
                    usuario
                }

            } catch (error) {
                console.log(error);
            }
        }
    }
});

server.listen().then(({ url }) => {
    console.log(`Servidor listo en la URL ${url}`);
})