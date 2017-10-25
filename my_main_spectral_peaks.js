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
    //console.log(sampleRate);
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
        
        //code to draw black rectangle
        var rectW = 1024
        j+=1;
        if (j>rectW/2){ //the max has to be half or less of rec width
            j=0;
            ctx.fillRect(0,0,rectW,625);
        }
        var max = 0;
        
        var elFrequencyData = equalLoudness(frequencyData); //apply the equal loudness filter
        //console.log(elFrequencyData);
        for (var i = 0; i<525;i++){ //cutting off at 625 and 100
            
            var reduce = elFrequencyData[i+100]; 
            if (reduce<0){
                reduce=0;
            }

            var salient = spectralPeak(reduce,i+100,elFrequencyData);
            if (salient != 0){
                ctx.fillStyle = colorize(salient);
                ctx.fillRect(j*2,520-i,2,5);
            }
            //calculating max for particular moment in time
            if (elFrequencyData[i]>max){
                max = elFrequencyData[i+100];
            }
        }
        
        //console.log(max);
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


function spectralPeak(peak,index,data){
    result = peak;
    for(var i=1;i<20;i++){
        if(peak<data[index-i]||peak<data[index+i]){
            result = 0;
        }
    }
    return result;
}


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
        //console.log(bSum + ", " + aSum)
    }
    return y;
}


var a = [
         1.00000000000000,
         -2.37898834973084,
         2.84868151156327,
         -2.64577170229825,
         2.23697657451713,
         -1.67148153367602,
         1.00595954808547,
         -0.45953458054983,
         0.16378164858596,
         -0.05032077717131,
         0.02347897407020
]

var b = [
         0.15457299681924,
         -0.09331049056315,
         -0.06247880153653,
         0.02163541888798,
         -0.05588393329856,
         0.04781476674921,
         0.00222312597743,
         0.03174092540049,
         -0.01390589421898,
         0.00651420667831,
         -0.00881362733839
]
 
/*
var a = [
         1.00000000000000,
         -3.47845948550071,
         6.36317777566148,
         -8.54751527471874,
         9.47693607801280,
         -8.81498681370155,
         6.85401540936998,
         -4.39470996079559,
         2.19611684890774,
         -0.75104302451432,
         0.13149317958808
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
*/
function avg(data){
    var sum = 0;
    for (var i = 0; i<data.length;i++){
        sum +=data[i];
    }
    return Math.round(sum/data.length);
}

function colorize(data){
    var d2 = data * 90/(255);
    //var d2 = d1 * d1
    var d3 = parseInt(d2+"",10)+10;
    var d4 = d3;
    if (d4>99)d4=99;
    if (d3<10)d4 = "0" +d3;
    //console.log(d4);
    //var d5 = parseInt((d4 / 2)+"",10);
    //if (d4<0) d4 = 0;
    return "#00" /*+ d4 + d4*/ + d4 + "00";
}

