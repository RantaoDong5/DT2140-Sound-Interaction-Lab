import("stdfaust.lib");

// Maximum delay time in samples (1000ms at 44.1kHz = 44100 samples)
maxDelay = ma.SR; // 1 second worth of samples

// Bang trigger creates envelopes
trigger = button("trigger");

// vline~ envelope 1: 0 to 1 over 5000ms (for delay time modulation)
env1 = en.ar(5.0, 0.0, trigger) * ma.SR / 1000;
//env1 = trigger : ba.line(50000);

// vline~ envelope 2: complex envelope for oscillator amplitude
// 0, 1 0 0, 0 90 0, 0.89 60 91, 0 200 151
// This creates: jump to 1, decay to 0 over 90ms, jump to 0.89, decay to 0 over 200ms
env2_attack = 0.001;
env2_hold = 0.09;
env2_decay = 0.2;

env2 =  en.adsre(env2_attack, env2_hold, 0.89, env2_decay, trigger);
gate = button("gate") : ba.line(50000);

// Delay time calculation: env1 * 240 + 1.2
delayTimeSamples = (env1 * 240.0 + 1.2); // convert ms to samples

// Oscillator frequency: pow(env2, 7) * 2700
oscFreq = 7, env2 : pow * hslider("Freq", 2700, 20, 5000, 1);

// Main oscillator
osc = os.osc(oscFreq) * env2;

// Feedback loop with delay
feedbackLoop = (+ : de.delay(maxDelay, delayTimeSamples) : 
                fi.highpass(1, 23)) ~ (
                fi.lowpass(1, 10000) * 0.98);

// Add oscillator to feedback loop
mainSignal = osc : feedbackLoop;

// Output with attenuation
process = mainSignal * 0.3  * hslider("volume", 0.7, 0, 1, 0.01) : fi.lowpass(1, 5000) <: _, _ : dm.freeverb_demo;