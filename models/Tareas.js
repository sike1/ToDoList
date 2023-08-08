const Sequelize = require("sequelize");
const db = require("../config/db");
const shortid = require('shortid');
const Usuarios = require('./Usuarios');
const slug=require("slug")



const Tareas = db.define(
    "tarea",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: Sequelize.UUIDV4
        }, 
        tarea: {
            type: Sequelize.TEXT, 
            allowNull: false, 
        },
        slug:{
            type: Sequelize.STRING
        },
        fecha : {
            type : Sequelize.DATEONLY, 
            allowNull : false,
        },
        hora : {
            type : Sequelize.TIME, 
            allowNull : false,
            },
            
    }, {
        hooks: {
            async beforeCreate(tarea) {
                const url = slug(tarea.tarea).toLowerCase();
                tarea.slug = `${url}-${shortid.generate()}`;
            }
        }
    }
  );

Tareas.belongsTo(Usuarios,{onDelete: 'CASCADE'});

  
  module.exports = Tareas;