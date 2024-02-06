const Usuarios = require("../models/Usuarios");
const enviarEmail = require("../helpers/email.js");

const { generarJWT } = require("../helpers/tokens");
const shortid = require("shortid");

exports.formIniciarSesion = (req, res) => {
  res.render("iniciarSesion", {
    pagina: "Iniciar Sesión",
    csrfToken: req.csrfToken(),
  });
};

exports.iniciarSesion = async (req, res, next) => {
  // Realizar las validaciones antes de intentar crear el usuario
  req.checkBody("email", "El email es obligatorio").notEmpty();
  req.checkBody("password", "La Contraseña es obligatoria").notEmpty();

  // Leer los errores de express
  const erroresExpress = req.validationErrors();

  const { email, password } = req.body;

  //comprobamos si hay errores
  if (erroresExpress) {
    const errExp = erroresExpress.map((err) => err.msg);
    req.flash("error", errExp);
    return res.redirect("/");
  }

  //buscamos el usuario con los datos del login
  const usuario = await Usuarios.findOne({ where: { email: email } });

  if (!usuario) {
    req.flash("error", "El usuario no existe");
    return res.redirect("/");
  }

  if (usuario.activo === 0) {
    req.flash("error", "La cuenta no esta activada");
    return res.redirect("/");
  }

  if (!usuario.validarPassword(password)) {
    req.flash("error", "La contraseña es erronea");
    return res.redirect("/");
  }

  //autenticar al usuario
  const token = generarJWT({ id: usuario.id, nombre: usuario.nombre });
  //almacenar en cookie
  return res
    .cookie("_token", token, {
      httpOnly: true,
      //secure:true
    })
    .redirect("/administracion");
};

//cambiar contraseña
exports.formCambiarPassword = async (req, res) => {
  const usuario = await Usuarios.findByPk(req.usuario.id);
  res.render("cambiarPassword", {
    pagina: "Cambiar Contraseña",
    csrfToken: req.csrfToken(),
    usuario,
  });
};

exports.cambiarPassword = async (req, res, next) => {
  req
    .checkBody("anterior", "La contraseña anterior no puede ir vacio")
    .notEmpty();
  req.checkBody("password", "La contraseña no puede ir vacio").notEmpty();
  req
    .checkBody("confirmar", "La Contraseña es diferente")
    .equals(req.body.password);

  // Leer los errores de express
  const erroresExpress = req.validationErrors();

  // Comprobar si hay errores de validación antes de crear el usuario
  if (erroresExpress) {
    // Si hay errores de validación, redirige a la página de registro con los errores mostrados
    const errExp = erroresExpress.map((err) => err.msg);
    req.flash("error", errExp);
    return res.redirect("/cambiarPassword");
  }
  const usuario = await Usuarios.findByPk(req.usuario.id);

  //verificar si el password actual sea correcto
  if (!usuario.validarPassword(req.body.anterior)) {
    req.flash("error", "Contraseña actual no coincide");
    res.redirect("/administracion");
    return next();
  }

  const hash = usuario.hashPassword(req.body.password);

  usuario.password = hash;

  await usuario.save();
  req.flash(
    "exito",
    "Contraseña cambiada correctamente, vuelva a iniciar sesion"
  );
  res.clearCookie("_token").redirect("/");
};

exports.formEliminarCuenta = async (req, res) => {
  const usuario = await Usuarios.findByPk(req.usuario.id);
  if(!usuario){
    req.flash(
      "error",
      "Han habido un error intentelo de nuevo"
    );
    return res.redirect(`/perfil/${usuario.id}`);
  }

  try {
    // Url de confirmación
    const url = `http://${req.headers.host}/eliminarCuenta/${usuario.id}`;

    // Enviar email de confirmación
    await enviarEmail.enviarEmail({
      usuario,
      url,
      subject: "Elimina tu cuenta de ToDoList",
      archivo: "eliminarCuenta",
    });
    // Si no hay errores, se crea el usuario en la base de datos y se redirige a otra página, si es necesario.
    req.flash(
      "exito",
      "Hemos enviado un correo para eliminar tu cuenta"
    );
    res.redirect(`/perfil/${usuario.id}`);
  } catch (error) {
    console.log(error);
  }
};


exports.eliminarCuenta=async (req,res)=>{

  const usuario = await Usuarios.findByPk(req.params.id)

  //comprobamos si existe o no
  if(!usuario){
    req.flash("error", "Ese usuario ya no existe")
    return res.redirect("/")
  }

  //eliminamos al usuario de la DB
  await usuario.destroy()

  req.flash("exito", "Tu cuenta ha sido eliminada correctamente")
  return res.redirect("/")

}

// formulario Olvide Password
exports.formOlvidePassword=(req,res)=>{

  res.render("olvidePassword",{
    pagina: "Olvide Contraseña",
    csrfToken: req.csrfToken(),

  })
}

exports.olvidePassword=async(req,res)=>{

  const {email} = req.body

  const usuario = await Usuarios.scope("eliminarPassword").findOne({where:{email}})

  if(!usuario){
    req.flash("error", "Usuario no Existe")
    return res.redirect("/olvidePassword")
  }

  usuario.token = shortid.generate()
  usuario.save()
  
  try {
    // Url de confirmación
    const url = `http://${req.headers.host}/resetPassword/${usuario.token}`;

    // Enviar email de confirmación
    await enviarEmail.enviarEmail({
      usuario,
      url,
      subject: "Recuperar tu cuenta de ToDoList",
      archivo: "RecuperarPassword",
    });
    // Si no hay errores, se crea el usuario en la base de datos y se redirige a otra página, si es necesario.
    req.flash(
      "exito",
      "Hemos enviado un correo para recuperar tu contraeña"
    );
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
}

exports.formResetPass=async(req,res)=>{
  const {token} = req.params

  const usuario = await Usuarios.scope("eliminarPassword").findOne({where:{token}})

  if(!usuario){
    req.flash("error", "Usuario no Existe")
    return res.redirect("/")
  }

  res.render("resetPassword",{
    pagina: "Recupera tu contraseña",
    csrfToken: req.csrfToken(),
    token: usuario.token
  })
}

exports.resetPassword=async(req,res)=>{
  const {token} = req.params

 const usuario = await Usuarios.scope("eliminarPassword").findOne({where:{token}})

  req.checkBody("password", "La contraseña no puede ir vacio").notEmpty();
  req
    .checkBody("confirmar", "La Contraseña es diferente")
    .equals(req.body.password);

  // Leer los errores de express
  const erroresExpress = req.validationErrors();

  // Comprobar si hay errores de validación antes de crear el usuario
  if (erroresExpress) {
    // Si hay errores de validación, redirige a la página de registro con los errores mostrados
    const errExp = erroresExpress.map((err) => err.msg);
    req.flash("error", errExp);
    return res.redirect(`/resetPassword/${usuario.token}`);
  }
  const hash = usuario.hashPassword(req.body.password);

  usuario.password = hash;
  usuario.token = ""

  await usuario.save();
  req.flash(
    "exito",
    "Contraseña cambiada correctamente, vuelva a iniciar sesion"
  );
  res.clearCookie("_token").redirect("/");
}

//cerrar Sesion
exports.cerrarSesion = (req, res) => {
  return res.clearCookie("_token").redirect("/");
};
