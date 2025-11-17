import("stdfaust.lib");
import("reverbs.lib");
import("compressors.lib");

// UI controls
freq = hslider("freq [unit:Hz]", 440, 20, 2000, 0.01) : si.smoo;
gain = hslider("gain", 0.5, 0, 1, 0.01) : si.smoo;
numPartials = hslider("num_partials", 8, 1, 128, 1);

// Function to generate a single partial with harmonic number n
partial(n) = os.osc(freq + (n)) * (1.0/(1));

t = button("gate") : si.smoo;

// Create 32 oscillators (maximum) and selectively enable them based on numPartials
process = par(i, 128, partial(i+1) * (i < numPartials)):> _ * (gain/4)* t <: _,_ :> co.limiter_1176_R4_mono : re.jcrev ;