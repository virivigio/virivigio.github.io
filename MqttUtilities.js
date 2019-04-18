
const icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADTUlEQVRIS63VTWgUZxgH8P+7Mzsf+2U2SrPJKBoEA1WKUMzupaKHpgoetadCnaBN9FRaLLRQEW17KKIed1V21dJLbU/FRqiixx219NDaVi+NmnWNZT+cze7Ozsf7yoxEYpnMRJI5DQzP+5v3P8/7DEHANVHM7iXAVyAkwQCNgZYjDp3KH7jzZ1DdwmckBLirrE29KQgcTNOBZTrQdYP2es631LSPnp34zQqDlgTIcvTlOowxNBsG6o3uHw6he899eOt+EBIGeBHxUW5ElDjEYwKSKdFbzzAsVB61/q4lWlsvv3/XXAwJBOaL9pe29slE3MgoOSHF+N0DAwnwfASNehe1WudkYVw7sixgYfFkMXtSikU/VZQU3LhmHjVZ17Sz59Tbt/2QJe3glUIGMnEhe3PgjcR2Ny5dN/Df0873ebX8gS/wshUBUMK+PKveuhzWGZPF0fdiceHq4FAK3a6FyoyuFca13GKA14ruw8qM/ldhXNscBnz03duDUSY83jCchu04ePBvs5ZXtTW+wGQpW12/IZ1xP9r0dAM9g2bOH9Rmg5DDpW0ZwvFVD7CpW1ctqNqQP1DM/ZJRErvdFqw+bqHdMccKqvZr4AEsbdsVj4lTbkTttolqtXWloGp7FtlB7uv+1fIX6bSM9pyJJ9W5a3m1PAYC5ou4H7mUvT44mNwZTwio17to1Dsn8qp21Bc4cGl0WCLcP+vW9wkRQrxddNrW6cyw9NmxnTfthUX7ftgs9LcTP8dkfmxIWeW16cOHTdO22EheLU8v2qYTxezn6bT8zeo1MS/T2dk5GB3rHgNOMd6+SsFxnE3eJcAnohwdUZQkQAjqtTYadePHwri2L/CgHbuxg3/ywPhdUZJbJOnF3GnpPS9fw7ABAkgij3h8flS46REYPRvVig5KoebV8oXAg3bw4ugmjkV+6u+Xt/T1SSDE/wy6sTxrdiHHBYgCH4q8ssqLjOPHZYk/kkiKEUHg4Y5qBgbLpDBNG62W5Rhde4rjsGdISUEUgxHf1zx0MfsWdTBGCHIAeQeABbAyBdPmfziTpdz+SASlMOT1Z9GCoJeCLAtwrTBk2UAYsiKAH+JN2YreXDHg/wilzJ3Oz1YUmEcYY2fce0LIx88BFi6vvp70RPYAAAAASUVORK5CYII=";

class MqttUtilities {

    constructor() {

        this.scratchMqttClient = null;

        this.SERVER = null;
        this.PORT = null;
        this.TOPIC = null;
    }

    getInfo() {
        return {
            id: 'mqttUtilities',
            name: 'MqttUtilities',

            colour: '#8BC34A',
            colourSecondary: '#7CB342',
            colourTertiary: '#689F38',

            menuIconURI: icon,

            blocks: [
                {
                    opcode: 'ping',

                    blockType: Scratch.BlockType.REPORTER,

                    text: 'Ping [DEST]',
                    arguments: {
                        DEST: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'https://en01hstmn4vabx.x.pipedream.net'
                        }
                    }
                },
                {
                    opcode: 'mqttCreate',

                    blockType: Scratch.BlockType.COMMAND,

                    text: 'Connect to MQTT server [SERVER] on port [PORT] and topic [TOPIC]',
                    arguments: {
                        SERVER: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'iot.eclipse.org'
                        },
                        PORT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '80'
                        },
                        TOPIC: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'World'
                        }
                    }
                },
                {
                    opcode: 'mqttSend',

                    blockType: Scratch.BlockType.REPORTER,

                    text: 'Send to MQTT [MESSAGE]',
                    arguments: {
                        MESSAGE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'ciao'
                        }
                    }
                }
            ]
        }
    }

    onConnect() {
        console.log("onConnect");
        this.scratchMqttClient.subscribe(this.TOPIC);
    }

    onConnectionLost(responseObject) {
        this.scratchMqttClient = null;
        console.log("onConnectionLost:"+responseObject.errorMessage);
        this.mqttCreate({SERVER: this.SERVER, PORT: this.PORT, TOPIC: this.TOPIC});
    }

    onMessageArrived(message) {
        console.log("onMessageArrived:"+message.payloadString);
    }

    mqttCreate({SERVER,PORT,TOPIC}) {
        this.scratchMqttClient = new Paho.MQTT.Client(SERVER, Number(PORT), "scratchExtension" + new Date().getTime());

        this.scratchMqttClient.onConnectionLost = this.onConnectionLost;
        this.scratchMqttClient.onMessageArrived = this.onMessageArrived;

        // connect the client and THEN subscribe
        this.scratchMqttClient.connect({onSuccess: onConnect(TOPIC)});
    }

    mqttSend({MESSAGE}) {

        if (this.scratchMqttClient) {
            let mqttMessage = new Paho.MQTT.Message(MESSAGE);
            this.scratchMqttClient.send(mqttMessage);
        }
        else
            console.log("mqttSend: client no initialized");

    }

    ping({DEST}) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", DEST, false ); // false for synchronous request
        xmlHttp.send( null );
        return xmlHttp.responseText;
    }

}


console.log("Before loading PAHO source");

try {
    importScripts('https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.js');
    console.log("PAHO source loaded");
} catch (e) {
    console.log("PAHO source loading returned an error: ");
    console.log(e);
}

Scratch.extensions.register(new MqttUtilities());
console.log("End of MqttUtilities");
