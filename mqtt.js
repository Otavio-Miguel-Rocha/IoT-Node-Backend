function mqtt_especificacoes() {
    return {
        clientId: `micropython-weather-demo`,
        clean: true,
        connectTimeout: 4000,
        username: '',
        password: '',
        reconnectPeriod: 1000,
    }
};

module.exports = {
    mqtt_especificacoes
};