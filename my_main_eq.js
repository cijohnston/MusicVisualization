window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

var myCanvas = document.getElementById('main_canvas');
var ctx = myCanvas.getContext('2d');
var j = 0;

window.onload = function() {
    var audioCtx = new AudioContext();
    var audio = document.getElementById('audio');
    var audioSrc = audioCtx.createMediaElementSource(audio);
    var analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    var sampleRate = audioCtx.sampleRate;
    console.log(sampleRate);
    audio.volume = 1;
    // connect the MediaElementSource with analyser
    audioSrc.connect(analyser);
    audioSrc.connect(audioCtx.destination);
    
    // frequencyBinCount number of arrays we're getting of frequencyData
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);
    
    // we're ready to receive some data!
    // loop
    
    function renderFrame() {
        requestAnimationFrame(renderFrame);
        // update data in frequencyData
        analyser.getByteFrequencyData(frequencyData);
        
        //take average of all frequaency wave levels
        var fq = avg(frequencyData);
        
        //ctx.fillStyle = '#F0F8FF';
        //ctx.fillRect(0,0,1024,520);
        
        ctx.fillStyle = '#000000';
        
        j++;
        var max = 0;
        
        var elFrequencyData = equalLoudness(frequencyData);
        
        for (var i = 0; i<520;i++){
            ctx.fillStyle = colorize(elFrequencyData[i+100]);
            ctx.fillRect(j*2,520-i,2,1);
            if (elFrequencyData[i]>max){
                max = elFrequencyData[i];
            }
            
        }
        
        
    }
    audio.play();
    renderFrame();
    /*
     document.getElementById("fButton").onclick = function(e){
     audio.play();
     renderFrame();
     }
     */
};


function equalLoudness(x){
    var y = new Array(x.length);
    for(var n = 0; n<x.length; n++){
        var bSum = 0;
        for (var k = 0; k<b.length; k++){
            if (n-k>-1){
                bSum += b[k]*x[n-k];
            }
        }
        var aSum = 0;
        for (var k = 1; k<a.length; k++){
            if (n-k>-1){
                aSum += a[k]*y[n-k];
            }
        }
        y[n]=bSum-aSum;
        console.log(bSum + ", " + aSum)
    }
    return y;
}

var a = [
            1.00000000000000,
         	3.47845948550071,
         	-6.36317777566148,
         	8.54751527471874,
         	-9.47693607801280,
         	8.81498681370155,
         	-6.85401540936998,
         	4.39470996079559,
         	-2.19611684890774,
         	0.75104302451432,
         	-0.13149317958808
]

var b = [
         0.05418656406430,
         -0.02911007808948,
         -0.00848709379851,
         -0.00851165645469,
         -0.00834990904936,
         0.02245293253339,
         -0.02596338512915,
         0.01624864962975,
         -0.00240879051584,
         0.00674613682247,
         -0.00187763777362
]

function avg(data){
    var sum = 0;
    for (var i = 0; i<data.length;i++){
        sum +=data[i];
    }
    return Math.round(sum/data.length);
}

function colorize(data){
    var d2 = data * 99/(255);
    //var d2 = d1 * d1
    var d3 = parseInt(d2+"",10)+10;
    var d4 = (d3)+"";
    if (d3<10)d4 = "0" +d3;
    console.log(d4);
    //var d5 = parseInt((d4 / 2)+"",10);
    //if (d4<0) d4 = 0;
    return "#00" /*+ d4 + d4*/ + d3 + "00";
}

