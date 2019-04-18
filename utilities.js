class Utilities {

    constructor() {
        /**
         * The MQTT PAHO client
         * @type {Paho.MQTT.Client}
         */
        this.scratchMqttClient = null;

        this.SERVER = null;
        this.PORT = null;
        this.TOPIC = null;
    }

    getInfo() {
        return {
            id: 'utilities',
            name: 'Utlities',

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


console.log("here1");

//try {
//    importScripts('https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.js');
//    console.log("here2a");
//} catch (e) {
//    if (e) console.log("Error: "+e);
//    console.log("here2b");
//}

Scratch.extensions.register(new Utilities());
console.log("here3");
