import("stdfaust.lib");

// Parameters
runtime = hslider("runtime", 5.0, 0.0, 20.0, 0.01);
statorLevel = hslider("statorLevel", 0.7, 0.0, 1.0, 0.01);
brushLevel = hslider("brushLevel", 0.9, 0.0, 1.0, 0.01);
rotorLevel = hslider("rotorLevel", 0.6, 0.0, 1.0, 0.01);
maxSpeed = hslider("maxSpeed", 0.3, 0.0, 1.0, 0.01);
volume = hslider("volume", 0.5, 0.0, 1.0, 0.01);
tubeRes = hslider("tubeRes", 0.2, 0.0, 1.0, 0.01);

// Speed Control Envelope
motorEnv_raw = checkbox("gate") : ba.line(runtime * ma.SR);// : min(1) : *(2);

motorEnv1 = (1 - min(motorEnv_raw, 1)) : pow(6);
motorEnv2 = max(motorEnv_raw, 1) - 1;
motorEnv = (motorEnv1 + motorEnv2) * (-1) + 1;

// Drive signal
drive = motorEnv * (maxSpeed * (-2000)) : os.saw4 : *(0.5) : +(0.5);

// Rotor
rotor = no.noise : fi.bandpass(4, 2000, 2000) * brushLevel 
    : +(rotorLevel * 0.2) : *(drive : pow(4)) * 0.01;

// Stator
stator = drive * 2 : ma.frac : *(2 * ma.PI) : cos 
    : \(x).(x * x + 1) : \(x).(1/x - 0.5) : *(statorLevel) * 0.5 ;

// FM body resonance
onepole(x, coeff) = x : fi.pole(coeff);
resonance = (os.osc(178) * drive + motorEnv) : *(2 * ma.PI) : cos 
    : \(x).(x - onepole(x, exp(-2 * ma.PI * 180 / ma.SR)))
    : \(x).(x - onepole(x, exp(-2 * ma.PI * 180 / ma.SR)))
    : *(tubeRes);

// Mix
motor = motorEnv * (rotor + stator + resonance) * volume * 0.001;

process = motor : fi.dcblocker : ma.tanh <: _,_  :  re.stereo_freeverb(0.7, 0.5, 0.3, 30) ;