const express = require("express")
const router = express.Router()
const usuarioController = require("../controllers/usuariosControllers")
const adminControllers = require("../controllers/adminControllers")
const tareaControllers = require("../controllers/tareasControllers")
const authControllers = require("../controllers/authControllers")


const {protegerRuta} = require("../middleware/protegerRuta")





module.exports = function() {

    //crear cuenta
    router.get("/crearCuenta",usuarioController.formCrearCuenta)
    router.post("/crearCuenta",usuarioController.crearCuenta)
    //confirmar cuenta
    router.get("/confirmarCuenta/:email",usuarioController.confirmarCuenta)
    router.post("/eliminarCuenta", protegerRuta, authControllers.formEliminarCuenta)
    router.get("/eliminarCuenta/:id",authControllers.eliminarCuenta)




    router.get("/",authControllers.formIniciarSesion)
    router.post("/",authControllers.iniciarSesion)

    //Cerrar Sesion
    router.get("/cerrarSesion",authControllers.cerrarSesion)

    //Administracion
    router.get("/administracion",protegerRuta,adminControllers.administracion)
    

    //Tareas
    router.get("/nuevaTarea",protegerRuta, tareaControllers.formNuevaTarea)
    router.post("/nuevaTarea",protegerRuta, tareaControllers.crearTarea)
    //Editar Tareas
    router.get("/editarTarea/:slug",protegerRuta, tareaControllers.formEditarTarea)
    router.post("/editarTarea/:slug",protegerRuta, tareaControllers.editarTarea)

    //Eliminar Tareas
    router.get("/eliminarTarea/:slug",protegerRuta, tareaControllers.eliminarTarea)

    //Perfil
    router.get("/editarPerfil",protegerRuta, usuarioController.formEditarPerfil)
    router.post("/editarPerfil",protegerRuta,usuarioController.subirImagen, usuarioController.editarPerfil)
    //Mostrar perfil
    router.get("/perfil/:id",protegerRuta,usuarioController.mostrarPerfil)

    //Cambiar Contraseña
    router.get("/cambiarPassword",protegerRuta, authControllers.formCambiarPassword)
    router.post("/cambiarPassword",protegerRuta, authControllers.cambiarPassword)

    //olvide Contraseña
    router.get("/olvidePassword", authControllers.formOlvidePassword)
    router.post("/olvidePassword", authControllers.olvidePassword)

    //Resetear Password
    router.get("/resetPassword/:token", authControllers.formResetPass)
    router.post("/resetPassword/:token", authControllers.resetPassword)









    















    return router
}