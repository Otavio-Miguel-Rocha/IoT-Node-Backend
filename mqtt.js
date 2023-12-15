function mqtt_especificacoes() {
    return {
        clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
        clean: true,
        connectTimeout: 4000,
        username: '123',
        password: '123',
        reconnectPeriod: 1000,
    }
};

module.exports = {
    mqtt_especificacoes
};