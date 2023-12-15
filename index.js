// Mqtt ===========================================

const mqtt = require('mqtt');
const connectUrl = `mqtt://broker.mqttdashboard.com`;
const { mqtt_especificacoes } = require('./mqtt');
const client = mqtt.connect(connectUrl, mqtt_especificacoes());


client.on('connect', () => {
    client.subscribe('wokwi-weather', (error) => {
        if (!error) {
            console.log('Inscrito na TEMPERATURA E UMIDADE DO WOWKI');
        } else {
            console.error('Subscription failed', error);
        }
    });
});

let infos = {
    temp: 0,
    humidity: 0
};
client.on('message', (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);

    const info = JSON.parse(message.toString());
    
    infos.humidity = info.humidity;
    infos.temp = info.temp;
    console.log(infos);
});


// API ============================================

const express = require('express');
const app = express();


app.listen(3000, () => console.log(`API rodando na porta ${3000}`));


app.get(`/informations`, (_, res) => {
    console.log(infos);
    return res.status(200).json(infos);
});
