//BANCO DE DADOS
require("./database/connection");
Lote = require("./models/lote");
Envase = require("./models/envase")
// -------------------------------------------------------

// MQTT
const mqtt = require('mqtt');
const { mqtt_especificacoes } = require('./mqtt');

const client = mqtt.connect('mqtt://broker.mqttdashboard.com', mqtt_especificacoes());

client.on('connect', () => {
    client.subscribe('leite-informacoes-setor-2', (error) => {
        if (!error) {
            console.log('CONECTADO AO TÓPICO LEITE DO SETOR 2');
        } else {
            console.error('Subscription failed', error);
        }
    });
});
client.on('message', (topic, message) => {
    if (topic === 'leite-informacoes-setor-2') {
        console.log('Mensagem recebida do tópico leite:', message.toString());
        Lote.create(JSON.parse(message.toString()));
    }
});
// -------------------------------------------------------


// API
const express = require('express');
const app = express();

app.listen(3000, () => console.log(`API rodando na porta ${3000}`));



//REQUISIÇÕES / LÓGICA

app.get(`/leites-informacoes`, async (_, res) => {
    //Lista que será retornada para a tela inicial do front
    let returnedList = [
        { quantidadeLeite: getQuantidadePorTipo(INTEGRAL), tipo: "INTEGRAL" },
        { quantidadeLeite: getQuantidadePorTipo(SEMIDESNATADO), tipo: "SEMIDESNATADO" },
        { quantidadeLeite: getQuantidadePorTipo(SEMIDESNATADO), tipo: "DESNATADO" },
        { quantidadeLeite: getQuantidadePorTipo(SEMIDESNATADO), tipo: "SEM LACTOSE" },
    ];




    return res.status(200).json(returnedList);
});


// {
//  id
//
app.put(`/iniciar-processo`, async (req, res) => {
    let envasamento = {
        quantidadeTotal: req.body.quantidadeLeite,
        tipo: req.body.nome
    };
    console.log(envasamento);
    let envaseIniciado = await Envase.create(envasamento)
    console.log(envaseIniciado);
});

function getQuantidadePorTipo(tipo) {
    //find all no banco
    let lote = await Lote.findAll();

    //For each que contabiliza a quantidade de leite
    let somaFinal = 0;
    lote.forEach((lote) => {
        let index = 5;
        if (tipo == lote.tipo) {
            somaFinal += lote.quantidadeLeite;
        }
    });
    return somaFinal;
}