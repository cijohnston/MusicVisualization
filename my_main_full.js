window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

var myCanvas = document.getElementById('main_canvas');
var ctx = myCanvas.getContext('2d');
//var startButton
var j = 0;
//var frequenciesBuffer = new ArrayBuffer(8);
//var totalFreq = new Uint8Array();
var totalFreq = new Array();
var gameNotes = new Array();
var prevNote = 0;
var place = 1;

//window.onload = function() {
function startFunction(){
    var audioCtx = new AudioContext();
    var audio = document.getElementById('audio');
    audio.src = URL.createObjectURL(document.getElementById("audioSrc").files[0]);
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
    audioSound.src = URL.createObjectURL(document.getElementById("audioSrc").files[0]);
    //var audioSoundSrc = audioCtx.createMediaElementSource(audioSound);
    /*
    var canvasSet = new Array();
    for (var i = 0; i<260; i++){
        var nuCanvas = document.createElement('canvas');
        nuCanvas.id = "canvas"+i;
        nuCanvas.width = 1200;
        nuCanvas.height = 2;
        canvasSet.push(nuCanvas);
    }
    */
    
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
        
        //ctx.fillStyle = '#000000';
        /*
        j+=2;
        if (j>600){
            j=0;
            ctx.fillRect(0,0,1200,this.height/2);
        }
         */
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
        //console.log(specGraph);
        //var totalFreq = new Uint8Array(frequenciesBuffer);
        totalFreq = totalFreq.concat(instFreq);
        //totalFreq = concatTypedArrays(totalFreq,instFreq);
        //frequencyBuffer = new ArrayBuffer(totalFreq);
        //console.log(specGraph);
        //console.log(instFreq[0]);
        //console.log(totalFreq[j-1]);
        eliminateMiniNotes();
        var nuSpecGraph = totalFreq[totalFreq.length-5];
        if(totalFreq.length>5){
            for (var i = 0; i<this.height;i++){
                nuSpecGraph[i] = salienceFunction(i,totalFreq[totalFreq.length-5]);
            }
        }
        totalFreq[totalFreq.length-5] = nuSpecGraph;
        reduceNoise();
        simplify();
        /*
        for (var i = 0;i<259;i++){
            canvasSet[i+1] = canvasSet[i];
            console.log(canvasSet[i].id)
        }*/
        if(totalFreq.length>20){
            
            //for (var i = 100; i<this.height;i++){
                //ctx = canvasSet[0].getContext('2d');
                  for (var k = 0; k< Math.min(this.height,totalFreq.length-20/4);k++){
                //if (avg(elFrequencyData.slice(i-10,i+10))<avg(elFrequencyData)){
               //     ctx.fillStyle = colorize(/*salienceFunction(i,*/
               //         totalFreq[totalFreq.length-20-k][i]/*)*/
               //     );
                      //ctx.fillStyle = "#009900";
                      //ctx.fillRect(gameNotes[totalFreq.length-16-k],k*4,2,4);
                      console.log(gameNotes[totalFreq.length-16-k]);
                      
                      if(gameNotes[totalFreq.length-16-k]!=0) {
                          ctx.fillStyle = "#009900";
                          ctx.fillRect(gameNotes[totalFreq.length-16-k]*40,k*4,2*40,4);
                          console.log(gameNotes[totalFreq.length-16-k]);
                      }
                      if (gameNotes[totalFreq.length-17-k]!=0) {
                          ctx.fillStyle = "#000000";
                          ctx.fillRect(gameNotes[totalFreq.length-17-k]*40,k*4,2*40,4);
                      }
                      
                //}else{
                //    ctx.fillStyle = colorize(0);
                //}
                //console.log(colorize(salient));
                //    ctx.fillRect(i-100,k*4,2,4);
                //ctx.fillRect((j),this.height/2-150-(i/2),2,1);
                }
           // }
        }
        if (totalFreq.length==20) audioSound.play();
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

function simplify(){
    if (totalFreq.length<20)return 0;
    var right = totalFreq.length-1;
    var left = totalFreq.length-15;
    for (var k = 0; k<this.height;k++){
        if (totalFreq[right][k]==0&&totalFreq[right-1][k]!=0){
            for(var i = right; i > left; i--){
                if(totalFreq[i-1][k]!=0){
                    totalFreq[i][k]= 0;
                }else{
                    break;
                }
            }
        }
    }
    gameNotes[totalFreq.length-15] = 0;
    for(var k = 0; k<this.height;k++){
        if (totalFreq[left][k]!=0){
            gameNotes[totalFreq.length-15] = relationship(k);
            prevNote = k;
            place = gameNotes[totalFreq.length-15];
        }
    }
    
}

function relationship(k){
    if(k>prevNote){
        return Math.min(4,place+1);
    } else if (k<prevNote){
        return Math.max(1,place-1);
    } else {
        return place;
    }
}

function reduceNoise(){
    if (totalFreq.length<11)return 0;
    var right = totalFreq.length-1;
    var left = totalFreq.length-6;
    var scenePitches = new Array();
    for (var k = 0; k<this.height;k++){
        var on = false;
        for(var i = right; i > left; i--){
            if(salienceFunction(k,totalFreq[i])>69){
                //var index = findObj(k,scenePitches);
                //if(index == -1){
                if (on){
                    scenePitches[scenePitches.length-1].n++;
                } else {
                    scenePitches=scenePitches.concat([new obj(k)]);
                    //console.log(k);
                }
                //} else {
                //    scenePitches[index].n++;
                //}
                on = true;
            }
        }
    }
    //console.log(scenePitches[0].n);
    
    for (var i = 0; i < scenePitches.length; i++){
        var current = scenePitches[i];
        for (var j = 0; j < scenePitches.length; j++){
            if(scenePitches[j].k>current.k-10 && scenePitches[j].k<current.k+10){
                scenePitches[i].total+=scenePitches[j].n;
            }
        }
    }
    //console.log(scenePitches.length);
    
    var max = new obj(0);
    for (var i = 0; i < scenePitches.length; i++){
        if(scenePitches[i].total>max.total){
            max = scenePitches[i];
        }
    }
    //console.log(max.k);
    var nuFreq = Array.apply(null, Array(totalFreq[totalFreq.length-10].length)).map(Number.prototype.valueOf,0);
    for (var k = Math.max(0,max.k-10); k<Math.min(max.k+10,this.height);k++){
        //for(var i = right;i> left ;i--){
            //if (totalFreq[totalFreq.length-1][k]>0 /*&& k<max.k-10 || totalFreq[totalFreq.length-1][k]>0 &&  k>max.k+10*/){
                //console.log(k);
                nuFreq[k]=totalFreq[totalFreq.length-10][k];
               
            //}
        //}
    }
    //  console.log(nuFreq[max.k]);
    // console.log(nuFreq.splice(nuFreq.length*3/4,nuFreq.length-1));
    totalFreq[totalFreq.length-10]=nuFreq;
    //return nuFreq;
    //fix this shit. I think you may need to replace totalFreq or duplicate it with one in which the salience function has beed done. fucking duh man.
}

function findObj(k,data){
    for(var i = 0;i<data.length;i++){
        if(data.k==k){
            return i;
        }
    }
    return -1;
}

function obj(k){
    this.k=k;
    this.n=0;
    this.total=0;
}

function eliminateMiniNotes(){
    if (totalFreq.length<5)return 0;
    var del = totalFreq.length-1;
    var cutoff = 3;
    for (var k = 0; k<this.height;k++){
        //for(var i = totalFreq.length-1;i>totalFreq.length-4;i--){
        if (totalFreq[del][k]==0&&totalFreq[del-cutoff][k]==0){
            for(var i = del-1;i>del-cutoff;i--){
                totalFreq[i][k]=0;
            }
            //console.log(0);
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

