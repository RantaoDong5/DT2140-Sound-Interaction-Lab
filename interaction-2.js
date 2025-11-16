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


const flatThreshold = 10;

const tiltThreshold = 5;

const Cooldown = 4000;

let lastWindTime = 0;





// Change here to ("tuono") depending on your wasm file name
const dspName = "windchimes";
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
windchimes.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        //dspNode.setParamValue("/wind_chimes/wind", 2);
        const exampleMinMaxParam = findByAddress(dspNodeParams, "/wind_chimes/wind");
        // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
        const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
        console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
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
    // playAudio()
}



function rotationChange(rotx, roty, rotz) {
    const now = millis();

    if (Math.abs(rotx) > flatThreshold) {
        return;
    }

    const tiltY = roty;

    if (Math.abs(tiltY) < tiltThreshold) {
        return;
    }

    if (now - lastWindTime < Cooldown) {
        return;
    }
    lastWindTime = now;

    playWindchimesTilt(Math.abs(tiltY));
}




function mousePressed() {
    //playAudio()
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
    dspNode.setParamValue("/englishBell/gate", 1)
    setTimeout(() => { dspNode.setParamValue("/englishBell/gate", 0) }, 100);
}

function playWindchimesTilt(tiltAbs) {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }

    const windAddr = "/wind_chimes/wind";

    const [minW, maxW] = getMinMaxParam(windAddr);

    const maxTilt = 60;
    let t = tiltAbs;
    if (t > maxTilt) t = maxTilt;

    let norm = t / maxTilt;
    norm = norm * ( 2 - norm );

    //const currentWind  = minW + (maxW - minW) * 0.7 + (maxW - (maxW - minW) * 0.7) * norm;
    //const currentWind  = minW + (maxW - minW) * norm;
    const currentWind  = maxW;

    dspNode.setParamValue(windAddr, 2);

    setTimeout(() => {
        if (!dspNode) return;
        dspNode.setParamValue(windAddr, minW);
    }, 4000);
}



//==========================================================================================
// END
//==========================================================================================