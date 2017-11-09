window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

var myCanvas = document.getElementById('main_canvas');
var ctx = myCanvas.getContext('2d');
var j = 0;
//var frequenciesBuffer = new ArrayBuffer(8);
//var totalFreq = new Uint8Array();
var totalFreq = new Array();

window.onload = function() {
    var audioCtx = new AudioContext();
    var audio = document.getElementById('audio');
    var audioSrc = audioCtx.createMediaElementSource(audio);
    var analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    var sampleRate = audioCtx.sampleRate;
    //console.log(sampleRate);
    //audio.volume = 0;
    
    // connect the MediaElementSource with analyser
    audioSrc.connect(analyser);
    audioSrc.connect(audioCtx.destination);
    
    var gainNode = audioCtx.createGain();
    audioSrc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = -1.0;
    
    // frequencyBinCount number of arrays we're getting of frequencyData
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);
    
    //var audioSoundCtx = new AudioContext();
    var audioSound = document.getElementById('audioSound');
    //var audioSoundSrc = audioCtx.createMediaElementSource(audioSound);
    
    
    
    // we're ready to receive some data!
    // loop
    
    function renderFrame() {
        requestAnimationFrame(renderFrame);
        // update data in frequencyData
        analyser.getByteFrequencyData(frequencyData);
        
        
        //take average of all frequaency wave levels
        var fq = avg(frequencyData);
        this.height = 1200;
        //ctx.fillStyle = '#F0F8FF';
        //ctx.fillRect(0,0,1024,520);
        
        ctx.fillStyle = '#000000';
        
        j+=1;
        if (j>600){
            j=0;
            ctx.fillRect(0,0,1200,this.height/2);
        }
        var max = 0;
        
        var elFrequencyData = equalLoudness(frequencyData);
        //console.log(avg(elFrequencyData));
        var specGraph = Array.apply(null, Array(elFrequencyData.length)).map(Number.prototype.valueOf,0);
        for (var i = 0; i<specGraph.length; i++){
            specGraph[i]=0;
        }
        for (var i = 0; i<this.height;i++){
            var reduce = elFrequencyData[i];
            if (reduce<0){
                reduce=0;
            }
            var spectral = spectralPeak(reduce,i,elFrequencyData);
            specGraph[i] = spectral;//salienceFunction(i,spectral>10);
            
            //if (elFrequencyData[i]>max){
            //    max = elFrequencyData[i];
            //}
        }
        
        var instFreq = new Array(1);
        instFreq[0] = specGraph;
        //var totalFreq = new Uint8Array(frequenciesBuffer);
        totalFreq = totalFreq.concat(instFreq);
        //totalFreq = concatTypedArrays(totalFreq,instFreq);
        //frequencyBuffer = new ArrayBuffer(totalFreq);
        //console.log(specGraph);
        //console.log(instFreq[0]);
        //console.log(totalFreq[j-1]);
        eliminateMiniNotes();
        if(totalFreq.length>20){
            for (var i = 0; i<this.height;i++){
                //if (avg(elFrequencyData.slice(i-10,i+10))<avg(elFrequencyData)){
                    ctx.fillStyle = colorize(salienceFunction(i,totalFreq[totalFreq.length-20]));
                //}else{
                //    ctx.fillStyle = colorize(0);
                //}
                //console.log(colorize(salient));
                ctx.fillRect((j)*2,this.height/2-150-(i/2),2,1);
            }
        }
        if (totalFreq.length==15) audioSound.play();
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

function concatTypedArrays(a, b) { // a, b TypedArray of same type
    var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}

function eliminateMiniNotes(){
    if (totalFreq.length<5)return 0;
    var del = totalFreq.length-1;
    var cutoff = 3
    for (var k = 0; k<this.height;k++){
        //for(var i = totalFreq.length-1;i>totalFreq.length-4;i--){
        if (totalFreq[del][k]==0&&totalFreq[del-cutoff][k]==0){
            for(var i = del-1;i>del-cutoff;i--){
                totalFreq[i][k]=0;
            }
            console.log(0);
        }
        //}
    }
}

function salienceFunction(freq,data){
    var result = 0;
    if (data[freq]>0){
        if (data[freq*2]>0&&freq>15/*&&data[freq/2]==0*/){
            var bool = true;
            for (var t = freq/2-6;t<freq/2+6;t++){
                if (data[t]>0){
                    bool = false
                }
            }
            if (bool)result = 255;
        }
    }
    return result;
}

function spectralPeak(peak,index,data){
    result = peak;
    for(var i=1;i<15;i++){
        if(peak<data[index-i]||peak<data[index+i]){
            result = 0;
        }
    }
    if (result!=0){
        result = 255;
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

