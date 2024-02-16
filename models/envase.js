const { DataTypes, Model } = require("sequelize");
const connection = require("../database/connection");

class Envase extends Model { }

Envase.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        quantidadeEnvasada: {
            type: DataTypes.NUMBER,
            allowNull: true,
        },
        quantidadeFinal: {
            type: DataTypes.NUMBER,
            allowNull: false,
        },
        tipo: {
            type: DataTypes.ENUM("INTEGRAL", "SEMIDESNATADO", "DESNATADO", "SEM LACTOSE"),
            allowNull: false,
        },
    },
    {
        sequelize: connection,
        modelName: "Lote",
    }
);

Envase.sync(
    {
        alter: true
    }
)
    .then(() => {
        console.log("Lote Sincronizado");
    })
    .catch((e) => {
        console.log("Lote não Sincroniza: ", e);
    });

module.exports = Envase;