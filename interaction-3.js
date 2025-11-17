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


const biasThreshold = 90;

let lastMoveTime = 0;
const Cooldown = 300;



// Change here to ("tuono") depending on your wasm file name
const dspName = "insects";
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
insects.createDSP(audioContext, 1024)
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

    // playAudio()


}




function rotationChange(rotx, roty, rotz) {
    
    // rotz: 0/360, north, 315 north east

    const northeast = 315;

    let biasZ = rotz - northeast;

    if (biasZ > 180) biasZ -= 360;
    if (biasZ < -180) biasZ += 360;


    if (
        (now - lastMoveTime) > Cooldown
    ) {
        lastMoveTime = now;
        playInsects(Math.abs(biasZ));
    }




    playInsects(Math.abs(biasZ));
}






function mousePressed() {
    //playAudio(mouseX/windowWidth)
    // Use this for debugging from the desktop!
    //playInsects(30);
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

function playAudio(pressure) {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }
    console.log(pressure)
    dspNode.setParamValue("/brass/blower/pressure", pressure)
}



function playInsects(biasAngle) {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }

    const insectsAddr = "/insects/gain";

    const [minG, maxG] = getMinMaxParam(insectsAddr);

    let t = biasAngle;
    if (t > biasThreshold) t = biasThreshold;


    let norm = 1 - t / biasThreshold;
    //norm = norm * norm;

    const currentGain  = minG + (maxG - minG) * norm;

    dspNode.setParamValue(insectsAddr, currentGain);

        setTimeout(() => {
        if (!dspNode) return;
        dspNode.setParamValue(insectsAddr, currentGain);
    }, 300);


}


//==========================================================================================
// END
//==========================================================================================