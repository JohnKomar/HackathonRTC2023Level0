const WebSocket = require("ws");

class WebSocketClient {
    
  constructor() {
    this.webSocket = null;
    this.registertoken = null;
    this.callID = null;
  }

  async connect(url, username, password) {
    return new Promise((resolve, reject) => {
      this.webSocket = new WebSocket(url, {
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      });

      this.webSocket.on("open", () => {
        console.log("WebSocket connected");
        resolve();
      });

      this.webSocket.on("close", () => {
        console.log("WebSocket disconnected");
      });

      this.webSocket.on("message", (message) => {
        console.log("Received message:", JSON.parse(message.toString("utf-8")));

        try {
          const response = JSON.parse(message.toString("utf-8"));
          
          
          if (response.event === "response") {
            // Check if the response is an "event" type response and has the expected correlationId
            if (response.responseStatusCode === 200 ) { 
              if ( response.correlationId === "1171772563" ){
                   // Check if the response status code is 200 (success)
              if (response.registerToken) {
                // If it has a registerToken, resolve with it
                this.registerToken = response.registerToken;
                this.subscribeToCall(this.registerToken);
                console.log("Got the token!");
              }
             
              }
              if (response.correlationId === "11237085767"){
                console.log("Call Accepted")
              }
              if( response.correlationId === "1437085762"){
                console.log("Call Rejected")
              }
              if ( response.correlationId === "1433645762"){
                console.log("Call Ended")
              }
            }
          }

          // if (response.event === "callAccepted"){
          //   // this.endCall(this.registerToken, this.callID)
          //   console.log("Call Ended!")
          // }

        
          

          if (response.event === "callPresented") {
            if (response.call.callId) {
              this.callID = response.call.callId;
              this.callAccepted(this.registerToken, this.callID)
              

              // this.rejectCall(this.registerToken, this.callID)
              // this.endCall(this.registerToken, this.callID)
              // This is a call object
              const call = response.call;
              console.log("Received call object:", call);
              // Now you can work with the call object as needed
            }

           
          }
          if (response.event === "messageReceived"){
            if(response.message){
              const body = "hello"  
              
              this.MessageSend(this.registerToken, this.callID, body ) // <-- ( Hello there ) would be the value of the textbox message in the website
              console.log("Message sent")
            }
          }


        } catch (error) {
          // Handle JSON parsing errors
          reject(error);
        }
      });

      this.webSocket.on("error", (error) => {
        console.error("WebSocket error:", error);
        reject();
      });
    });
  }

  async disconnect() {
    if (this.webSocket) {
      this.webSocket.close();
    }
  }

  async sendMessage(message) {
    if (this.webSocket) {
      this.webSocket.send(JSON.stringify(message));
    }
  }

  async registerAgencyAction(agencyID, agencySecret) {
    const requests = {
      action: "registerAgency",
      agencyIdentifier: "hackrtc-28",
      correlationId: "1171772563",
      secret: "tzwIcR7g",
      maintenanceMode: false,
    };

    webSocketClient.sendMessage(requests);
  }

  async subscribeToCall(registerToken) {
    const requests = {
      action: "subscribe",
      correlationId: "1647085767",
      registerToken: registerToken,
    };

    webSocketClient.sendMessage(requests);
  }

  async callAccepted(registerToken, callID){
    const requests = {
      action: "acceptCall",
      correlationId: "11237085767",
      registerToken: registerToken,  
      callId: callID
    }

    webSocketClient.sendMessage(requests)
  }


  async rejectCall(registerToken, callID){
    const requests = {
      action: "rejectCall",
      correlationId: "1437085762",
      registerToken: registerToken,
      callId: callID
    }

    webSocketClient.sendMessage(requests)
  }

  async endCall(registerToken, callID){
    const requests = {
      action: "endCall",
      correlationId: "1433645762",
      registerToken: registerToken,
      callId: callID,
      body: "Ending call..."
    }

    webSocketClient.sendMessage(requests)
  }

  async MessageSend(registerToken,callId, body){
    const requests = {
      action: "sendMessage",
      correlationId: "1232645762",
      registerToken: registerToken,
      callId: callId,
      body: body
    }

    webSocketClient.sendMessage(requests)
  }


}

// Usage example
const webSocketClient = new WebSocketClient();
const url = "wss://hackrtc.indigital.dev/text-control-api/v3";
const username = "hackrtc-28";
const password = "tzwIcR7g";

const agencyID = "hackrtc-28";
const agencySecret = "tzwIcR7g";

webSocketClient
  .connect(url, username, password)
  .then(() => {
    console.log("Connected!");

    webSocketClient.registerAgencyAction(agencyID, agencySecret);
    console.log("Registered");

    // You can send and receive messages here
    // Example: webSocketClient.sendMessage({ action: 'subscribe', correlationId: '123' });
  })
  .catch((error) => {
    console.error("WebSocket connection error:", error);
  });
