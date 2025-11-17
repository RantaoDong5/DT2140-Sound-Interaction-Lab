//==========================================================================================
// AUDIO SETUP
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit just where you're asked to!
//------------------------------------------------------------------------------------------
//
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;


let MoveMin = 8;
let MoveMax = 18;

let lastMoveTime = 0;
const Cooldown = 150;



// Change here to ("tuono") depending on your wasm file name
const dspName = "torpedo";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

// The name should be the same as the WASM file, so change tuono with brass if you use brass.wasm
torpedo.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams());
        //  [ "/torpedo/Freeverb/0x00/Damp", "/torpedo/Freeverb/0x00/RoomSize", 
        // "/torpedo/Freeverb/0x00/Stereo_Spread", "/torpedo/Freeverb/Wet", 
        // "/torpedo/Freq", "/torpedo/trigger", "/torpedo/volume" ]
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        // const exampleMinMaxParam = findByAddress(dspNodeParams, "/thunder/rumble");
        // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
        // const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
        // console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    });


//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit the next functions to create interactions
// Decide which parameters you're using and then use playAudio to play the Audio
//------------------------------------------------------------------------------------------
//
//==========================================================================================


function accelerationChange(accx, accy, accz) {
    const magnitude = Math.sqrt(accx*accx + accy*accy + accz*accz);
    const now = millis();

    if (
        magnitude >= MoveMin &&
        //magnitude <= MoveMax &&
        (now - lastMoveTime) > Cooldown
    ) {
        lastMoveTime = now;
        playTorpedo(magnitude);
    }

}


function rotationChange(rotx, roty, rotz) {
}

function mousePressed() {

    if (!dspNode) {
        console.log("[mousePressed] dspNode not ready yet");
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }

    //playAudio()
    playTorpedo(10);
    // Use this for debugging from the desktop!
}



function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");
}

function deviceTurned() {
    threshVals[1] = turnAxis;
}
function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
    //playTorpedo(6);
    //playAudio();
}

function getMinMaxParam(address) {
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
    console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    return [exampleMinValue, exampleMaxValue]
}

//==========================================================================================
// AUDIO INTERACTION
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit here to define your audio controls 
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function playAudio() {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }
    // Edit here the addresses ("/thunder/rumble") depending on your WASM controls (you can see 
    // them printed on the console of your browser when you load the page)
    // For example if you change to a bell sound, here you could use "/churchBell/gate" instead of
    // "/thunder/rumble".
    dspNode.setParamValue("/thunder/rumble", 1)
    setTimeout(() => { dspNode.setParamValue("/thunder/rumble", 0) }, 100);
}




function playTorpedo(magnitude) {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }

    const freqAddr = "/torpedo/Freq";
    const volumeAddr  = "/torpedo/volume";
    const triggerAddr  = "/torpedo/trigger"


    const [minF, maxF] = getMinMaxParam(freqAddr);
    const [minV, maxV] = getMinMaxParam(volumeAddr);

    let t = (magnitude - MoveMin) / (MoveMax - MoveMin);
    t = Math.max(0, Math.min(1, t));
    t = t * t;

    //const safeMaxF = minF + (maxF - minF) * 0.8;
    const freq = minF + (maxF - minF) * t;

    //const safeMaxV = minV + (maxV - minV) * 0.8;
    const volume = minV + (maxV - minV) * t;

    dspNode.setParamValue(freqAddr, freq);
    dspNode.setParamValue(volumeAddr, volume);


    dspNode.setParamValue(triggerAddr, 1);
    setTimeout(() => {
        if (!dspNode) return;
        dspNode.setParamValue(triggerAddr, 0);
    }, 50);
}


//==========================================================================================
// END
//==========================================================================================