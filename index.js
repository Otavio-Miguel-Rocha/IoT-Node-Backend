//BANCO DE DADOS
require("./database/connection");
Lote = require("./models/lote");
Envase = require("./models/envase")
const Sequelize = require('sequelize');
// -------------------------------------------------------

// MQTT
const mqtt = require('mqtt');
const { mqtt_especificacoes } = require('./mqtt');

const client = mqtt.connect('mqtt://broker.mqttdashboard.com', mqtt_especificacoes());

client.on('connect', () => {
    client.subscribe('leite-informacoes-setor-2');
    client.subscribe('caixa-envasada');
    client.subscribe('quantidade-leite-envasado-2');
});



client.on('message', async (topic, message) => {
    if (topic === 'leite-informacoes-setor-2') {
        await Lote.create(JSON.parse(message.toString()));
    }


    if (topic === 'caixa-envasada') {
        console.log(message.toString());


        
        let sensor = JSON.parse(message.toString());

        let updatedEnvase =
            await Envase.findOne({
                where: {
                    tipo: sensor.tipo,
                    quantidadeEnvasada: {
                        [Sequelize.Op.lt]: Sequelize.col('quantidadeFinal')
                    }
                },
            })
        if(updatedEnvase.quantidadeEnvasada < updatedEnvase.quantidadeFinal){
            updatedEnvase.quantidadeEnvasada += 1;
        }
        await updatedEnvase.save();

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(updatedEnvase));
            }
        });
    }
});
// -------------------------------------------------------


// API
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: 'http://localhost:4200'
}));

app.listen(3000, () => console.log(`API rodando na porta ${3000}`));



//REQUISIÇÕES / LÓGICA

app.get(`/leites-informacoes`, async (_, res) => {
    console.log("ENTROU");
    //Lista que será retornada para a tela inicial do front
    let returnedList = [
        { quantidadeLeite: 0, tipo: "INTEGRAL", origem: "" },
        { quantidadeLeite: 0, tipo: "SEMIDESNATADO", origem: "" },
        { quantidadeLeite: 0, tipo: "DESNATADO", origem: "" },
        { quantidadeLeite: 0, tipo: "SEM LACTOSE", origem: "" },
    ];
    let lotes = await Lote.findAll();

    //For each que contabiliza a quantidade de leite
    await lotes.forEach((lote) => {
        if (!lote.utilizado) {
            let index = 5;
            if (lote.tipo == "INTEGRAL") {
                index = 0;
            } else if (lote.tipo == "SEMIDESNATADO") {
                index = 1;
            } else if (lote.tipo == "DESNATADO") {
                index = 2;
            } else if (lote.tipo == "SEM LACTOSE") {
                index = 3;
            }
            if (index >= 0 && index <= 3) {
                returnedList[index].quantidadeLeite += lote.quantidadeLeite;
                if(lote.quantidadeLeite > 0){
                    returnedList[index].origem = lote.origem;
                }
            }
        }
    })
    console.log(returnedList);
    return res.status(200).json(returnedList);
});

app.get(`/envase-existente`, async (req, res) => {
    let envases = await Envase.findAll();
    for (const envase of envases) {
        if (envase.quantidadeEnvasada < envase.quantidadeFinal) {
            return res.status(200).json(JSON.stringify(envase));
        }
    }
    return res.status(404).json("Nenhum envasamento ocorrendo!");
})

app.get(`/teste-envase`, async (_, res) => {
    return res.status(200).json(await Envase.findAll());
})
app.get(`/teste-lote`, async (_, res) => {
    return res.status(200).json(await Lote.findAll());
})


app.put(`/iniciar-processo`, async (req, res) => {
    let validacaoEnvases = await Envase.findAll({
        where: {
            tipo: req.query.tipo
        },
    });

    let processoJaExistente = false;
    for (const envase of validacaoEnvases) {
        if (envase.quantidadeEnvasada < envase.quantidadeFinal) {
            processoJaExistente = true;
        }
    }

    if (!processoJaExistente) {
        let lotes = await Lote.findAll({
            where: {
                utilizado: false
            }
        });

        let loteTipoEspecifico = lotes.filter(lote => lote.tipo == req.query.tipo);
        if (!loteTipoEspecifico) {
            return res.status(409).json("Nenhum lote com esse tipo de leite!");
        }
        for (let lote of loteTipoEspecifico) {
            let updatedLote = await Lote.findByPk(lote.id);
            updatedLote.utilizado = true;
            await updatedLote.save();

        }

        const somaTotal = loteTipoEspecifico.reduce((soma, lote) => soma + lote.quantidadeLeite, 0);


        let novoEnvase = {
            quantidadeFinal: somaTotal,
            quantidadeEnvasada: 0,
            tipo: req.query.tipo,
            origem: loteTipoEspecifico[0].origem,
            dataOrdenha: loteTipoEspecifico[0].dataOrdenha
        }

        await Envase.create(novoEnvase);


        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(novoEnvase));
            }
        });
        return res.status(201).json(novoEnvase);
    }
    return res.status(409).json("Processo já em andamento!");
});




app.put(`/enviar-setor-5`, async (req, res) => {
    console.log(req.query.idEnvase);
    let envaseFinalizado = await Envase.findOne({
        where: {
            id: req.query.idEnvase
        },
    });
    let finaObject = {
        quantidadeLeite: envaseFinalizado.quantidadeFinal,
        tipo: envaseFinalizado.tipo,
    }
    client.publish('quantidade-leite-envasado-2', JSON.stringify(finaObject));
    return res.status(200).json("Enviado para o setor 5!");
});

//WEB SOCKET
const WebSocket = require('ws');

const server = app.listen(433, () => {
    console.log('WEB SOCKET NA PORTA 433');
});
const wss = new WebSocket.Server({ server });


wss.on('connection', ws => {
    console.log('IHM - CONECTADA');
});



