
$.deferred.define();

$.extend({
    drawCircle: function() {
      function calcPos(center, r, index, total) {
        return [center[0] + r * Math.cos(2 * Math.PI * index / total),
                center[1] + r * Math.sin(2 * Math.PI * index / total)];
      }

      function drawCircleSub() {
        var center = [width / 2, height / 2];
        var r = 20;
        var total = 100;

        for (i=0; i < total; i++) {
          var currentPath = calcPos(center, r, i, total);
          var nextPath = calcPos(center, r, i + 1, total);
          ctx.moveTo(currentPath[0], currentPath[1]);
          ctx.lineTo(nextPath[0], nextPath[1]);
        }
      }

      var canvas = $('canvas')[0];
      $(canvas).attr({ width: window.innerWidth, height: window.innerHeight });
      var ctx = $('canvas')[0].getContext('2d');
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.beginPath();
      ctx.moveTo(-1, window.innerHeight / 2);

      var width = window.innerWidth;
      var height = window.innerHeight;
      drawCircleSub();
      ctx.stroke();
    },

    // see http://github.com/yanagia/jsaudio
    wavUtil: {
        playSaw: function(duration, f, factor) {
            var data = this.createSignal(duration, f, factor);
            return this.playUrl(this.convertToURL(data));
        },
        createSignal: function(t, sinF, factor){
            function createSignalSub(freq) {
              for(i = 0; i < t; i++){
                  sig = Math.sin(phase) * (1 - factor) + (Math.cos(phase) > 0 ? 1.0 : -1.0) * factor / 2;
                  sig = (sig + 1) / 2 * (255 - (255 * i / t));
                  signals += String.fromCharCode(sig);
                  phase += freq;
              };
            }
            function drawLine(freq) {
              for(i = 0; i < t; i++){
                  sig = Math.sin(phase) * (1 - factor) + (Math.cos(phase) > 0 ? 1.0 : -1.0) * factor / 2;
                  sig = (sig + 1) / 2 * (255 - (255 * i / t));
                  if (i < width && i % 5 == 0) {
                      ctx.lineTo(i, sig / 255 * height);
                  }
                  phase += freq;
              };
            }
            var i;
            var signals, sig, phase, hz;

            hz = 44100;
            phase = 0;
            t = Math.round(t*hz);
            var freq = sinF * 2.0 * Math.PI / hz;
            signals = "";

            var canvas = $('canvas')[0];
            $(canvas).attr({ width: window.innerWidth, height: window.innerHeight });
            var ctx = $('canvas')[0].getContext('2d');
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.beginPath();
            ctx.moveTo(-1, window.innerHeight / 2);

            var width = window.innerWidth;
            var height = window.innerHeight;
            createSignalSub(freq);
            createSignalSub(freq * (5.0 / 6.0));
            createSignalSub(freq * (4.0 / 6.0));
            drawLine(freq);
            ctx.stroke();
            return signals;
        },
        convertToURL: function(signals) {
            var wavefile = this.createWaveFile(signals);
            var encodedata = Base64.encode(wavefile);
            var dataurl = "data:audio/wav;base64," + encodedata;
            return dataurl;
        },

        createWaveFile: function createWaveFile(signals) {
            var header = this.headerPart(signals.length);
            var riff = this.riffPart(header.length + signals.length);
            return riff + header + signals;
        },

        headerPart: function(siglen) {
            var header;
            header = "WAVEfmt " + String.fromCharCode(16, 0, 0, 0);
            header += String.fromCharCode(1, 0); // format id
            header += String.fromCharCode(1, 0); // channels
            header += String.fromCharCode(68, 172, 0, 0); // sampling rate
            header += String.fromCharCode(68, 172, 0, 0); // byte/sec
            header += String.fromCharCode(1, 0); // block size
            header += String.fromCharCode(8, 0); // byte/sample
            header += "data";		       // data chunk label

            var sigsize;
            sigsize = String.fromCharCode((siglen >> 0 & 0xFF),
				          (siglen >> 8 & 0xFF),
				          (siglen >> 16 & 0xFF),
				          (siglen >> 24 & 0xFF));
            header += sigsize;
            return header;
        },

        riffPart: function(wavlen) {
            var riff =  "RIFF";
            riff += String.fromCharCode((wavlen >> 0 & 0xFF),
			                (wavlen >> 8 & 0xFF),
			                (wavlen >> 16 & 0xFF),
			                (wavlen >> 24 & 0xFF));
            return riff;
        },


        _header: function() {
        },
        playUrl: function(url){
            var $audio = $('<audio>').attr({ src: url, loop: 'loop' });
            $('body').append($audio);
            $audio.bind('canplay', function(){
                this.play()
            });
            $audio.bind('ended', function(){
                $(this).remove()
            });
            return $audio;
        }
    },
});

$(function(){
    var canvas = $('canvas');
    if (!canvas) {
        canvas = $('<canvas>');
        $('<body>').append(canvas);
    }

    var audio = null;
    var gotAxis = false;
    var lastMouseData = { x: 0, y: 0, z: 0 };

    var onData = function(data) {
        $.drawCircle();

        /*
        var pitch = (-data.y + 1) * 700.0;
        var new_audio = $.wavUtil.playSaw(0.3, pitch, Math.abs(data.x));
        if (audio) audio.remove();
        audio = null;
        audio = new_audio;
        */
    };
    onData();
    
        /*
    window.addEventListener(
        "MozOrientation",
        function(data) {
            gotAxis = true;
            lastMouseData = data;
        },true);

    $('body').bind('mousemove', function(ev) {
        if (!gotAxis) {
            lastMouseData = { x: ev.pageX / window.innerWidth * 2.0 - 1.0, y: ev.pageY / window.innerHeight * 2.0 - 1.0, z: 0 };
            //onData(lastMouseData);
        }
    });
    var mouseTimer = setInterval(function() {
        //if (gotAxis) clearInterval(mouseTimer);
        onData(lastMouseData);
    }, 900);
    */
});

