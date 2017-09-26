window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

var myCanvas = document.getElementById('main_canvas');
var ctx = myCanvas.getContext('2d');

window.onload = function() {
    var audioCtx = new AudioContext();
    var audio = document.getElementById('audio');
    var audioSrc = audioCtx.createMediaElementSource(audio);
    var analyser = audioCtx.createAnalyser();
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
        
        ctx.fillStyle = '#F0F8FF';
        ctx.fillRect(0,0,1024,520);
        
        ctx.fillStyle = '#000000';
        for (var i = 0; i<frequencyData.length;i++){
            ctx.fillRect(i,520-2*frequencyData[i],1,2*frequencyData[i]);
        }
            
        //console.log(frequencyData.length);
        
        
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


 
function avg(data){
    var sum = 0;
    for (var i = 0; i<data.length;i++){
        sum +=data[i];
    }
    return Math.round(sum/data.length);
}

