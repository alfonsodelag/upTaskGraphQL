// Resolvers are per field functions that are given a parent object, arguments, and the execution context, and are responsible for returning a 
// result for that field. Resolvers cannot be included in the GraphQL schema language, so they must be added separately. The collection of 
// resolvers is called the "resolver map".
const Usuario = require("../models/Usuario");
const Proyecto = require("../models/Proyecto");
const Tarea = require("../models/Tarea");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" })

// Crea y firma un JWT
const crearToken = (usuario, secreta, expiresIn) => {
    console.log(usuario);
    const { id, email } = usuario;
    return jwt.sign({ id, email }, secreta, { expiresIn });
}

// Esta es nuestra base de datos de Momento

const resolvers = {
    Query: {
        obtenerProyectos: async (_, { }, ctx) => {
            const proyectos = await Proyecto.find({ creador: ctx.usuario.id });
            return proyectos;
        },
        obtenerTareas: async (_, { input }, ctx) => {
            const tareas = await Tarea.find({ creador: ctx.usuario.id }).where('proyecto').equals(input.proyecto);

            return tareas;
        }
    },

    Mutation: {
        crearUsuario: async (_, { input }) => {
            const { email, password } = input;

            const existeUsuario = await Usuario.findOne({ email });

            console.log("existeUsuario", existeUsuario);

            // Si el usuario existe 
            if (existeUsuario) {
                throw new Error("El usuario ya está registrado");
            }

            try {
                // Hashear Password
                const salt = await bcrypt.genSalt(10);
                input.password = await bcrypt.hash(password, salt);

                // Registrar Nuevo usuario
                const nuevoUsuario = new Usuario(input);
                console.log(nuevoUsuario);

                nuevoUsuario.save();

            } catch (error) {
                console.log(error);
            }
        },
        autenticarUsuario: async (_, { input }) => {
            const { email, password } = input;

            // Si el usuario existe 
            const existeUsuario = await Usuario.findOne({ email });

            // Si el usuario existe 
            if (!existeUsuario) {
                throw new Error("El usuario no existe");
            }

            // Si el password es correcto 
            const passwordCorrecto = await bcrypt.compare(password, existeUsuario.password);

            console.log("passwordCorrecto", passwordCorrecto);

            if (!passwordCorrecto) {
                throw new Error("Password Incorrecto");
            }
            // Dar acceso a la app
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, "2hr")
            }
        },
        nuevoProyecto: async (_, { input }, ctx) => {
            console.log("Desde Resolver", ctx);

            try {
                const proyecto = new Proyecto(input);

                // Asociar el creador 
                proyecto.creador = ctx.usuario.id;

                // Almacenarlo en la BD
                const resultado = await proyecto.save();

                return resultado;
            } catch (error) {
                console.log(error);
            }
        },
        actualizarProyecto: async (_, { id, input }, ctx) => {
            // Revisar si el proyecto existe o no
            let proyecto = await Proyecto.findById(id);

            if (!proyecto) {
                throw new Error("Proyecto no Encontrado");
            }

            // Revisar que la persona que trata de editarlo, es su creador
            if (proyecto.creador.toString() !== ctx.usuario.id) {
                throw new Error("No tienes las credenciales para editar");
            }

            // Guardar el proyecto 
            proyecto = await Proyecto.findOneAndUpdate({ _id: id }, input, { new: true });
            return proyecto;
        },
        eliminarProyecto: async (_, { id }, ctx) => {
            // Revisar si el proyecto existe o no
            let proyecto = await Proyecto.findById(id);

            if (!proyecto) {
                throw new Error("Proyecto no Encontrado");
            }

            // Revisar que si la persona que trata de editarlo,  es el creador
            if (proyecto.creador.toString() !== ctx.usuario.id) {
                throw new Error("No tienes las credenciales para editarlo");
            }

            // Eliminar
            await Proyecto.findOneAndDelete({ _id: id });

            return "Proyecto Eliminado";
        },
        nuevaTarea: async (_, { id, input }, ctx) => {

            try {
                const tarea = new Tarea(input);
                tarea.creador = ctx.usuario.id;
                const resultado = await tarea.save();
                return resultado;

            } catch (error) {
                console.log(error);
            }
        },
        actualizarTarea: async (_, { id, input, estado }, ctx) => {
            // Revisar si la tarea existe o no 
            let tarea = await Tarea.findById(id);

            if (!tarea) {
                throw new Error("Tarea no encontrada");
            }

            // Si la persona que edita es el creador
            if (tarea.creador.toString() !== ctx.usuario.id) {
                throw new Error("No tienes las credenciales para editarlo");
            }

            // asignar el Estado 
            input.estado = estado;

            // Guardar y retornar la tarea
            return await Tarea.findOneAndUpdate({ _id: id }, input, { new: true });
        },
        eliminarTarea: async (_, { id, input, estado }, ctx) => {
            // Revisar si la tarea existe o no 
            let tarea = await Tarea.findById(id);

            if (!tarea) {
                throw new Error("Tarea no encontrada");
            }

            // Si la persona que edita es el creador
            if (tarea.creador.toString() !== ctx.usuario.id) {
                throw new Error("No tienes las credenciales para editarlo");
            }

            // Eliminar
            await Tarea.findOneAndDelete({ _id: id });

            return "Tarea Eliminada";
        }
    }
}

module.exports = resolvers;