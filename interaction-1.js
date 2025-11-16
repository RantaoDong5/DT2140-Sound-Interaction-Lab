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


let smallMoveMin = 1;
let smallMoveMax = 15;

let lastMoveTime = 0;
const Cooldown = 500;



// Change here to ("tuono") depending on your wasm file name
const dspName = "rain";
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
rain.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams());
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
        magnitude >= smallMoveMin &&
        magnitude <= smallMoveMax &&
        (now - lastMoveTime) > Cooldown
    ) {
        lastMoveTime = now;
        playRainSmallMove(magnitude);
    }

}


function rotationChange(rotx, roty, rotz) {
}

function mousePressed() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    //playAudio()
    playRainSmallMove(6);
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
    playRainSmallMove(6);
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




function playRainSmallMove(magnitude) {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }

    const densityAddr = "/rain/density";
    const volumeAddr  = "/rain/volume";

    const [minD, maxD] = getMinMaxParam(densityAddr);
    const [minV, maxV] = getMinMaxParam(volumeAddr);

    let t = (magnitude - smallMoveMin) / (smallMoveMax - smallMoveMin);
    t = Math.max(0, Math.min(1, t));

    const safeMaxD = minD + (maxD - minD) * 0.5;
    const density = minD + (safeMaxD - minD) * t;

    const safeMaxV = minV + (maxV - minV) * 0.5;
    const volume = minV + (safeMaxV - minV) * t;

    dspNode.setParamValue(densityAddr, density);
    dspNode.setParamValue(volumeAddr, volume);

    setTimeout(() => {
        dspNode.setParamValue(densityAddr, minD);
        dspNode.setParamValue(volumeAddr, minV);
    }, 400);
}


//==========================================================================================
// END
//==========================================================================================