import React, { memo, useCallback, useEffect, useRef } from 'react'
import { SimliClient } from 'simli-client';
import { updateTtsState } from '../../../tts/TtsState';
export const simliClient = new SimliClient();
export interface SimliCharacterProps {
    simli_faceid: string;
    simili_api_key: string;
    ttsAnalyzer: any;

}
const applyLowPassFilter = (
  data: Int16Array,
  cutoffFreq: number,
  sampleRate: number
): Int16Array => {
  // Simple FIR filter coefficients
  const numberOfTaps = 31; // Should be odd
  const coefficients = new Float32Array(numberOfTaps);
  const fc = cutoffFreq / sampleRate;
  const middle = (numberOfTaps - 1) / 2;

  // Generate windowed sinc filter
  for (let i = 0; i < numberOfTaps; i++) {
    if (i === middle) {
      coefficients[i] = 2 * Math.PI * fc;
    } else {
      const x = 2 * Math.PI * fc * (i - middle);
      coefficients[i] = Math.sin(x) / (i - middle);
    }
    // Apply Hamming window
    coefficients[i] *=
      0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (numberOfTaps - 1));
  }

  // Normalize coefficients
  const sum = coefficients.reduce((acc, val) => acc + val, 0);
  coefficients.forEach((_, i) => (coefficients[i] /= sum));

  // Apply filter
  const result = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < numberOfTaps; j++) {
      const idx = i - j + middle;
      if (idx >= 0 && idx < data.length) {
        sum += coefficients[j] * data[idx];
      }
    }
    result[i] = Math.round(sum);
  }

  return result;
};
export const downsampleAudio = (
  audioData: Int16Array,
  inputSampleRate: number,
  outputSampleRate: number
): Int16Array => {
  if (inputSampleRate === outputSampleRate) {
    return audioData;
  }

  if (inputSampleRate < outputSampleRate) {
    throw new Error("Upsampling is not supported");
  }

  // Apply low-pass filter to prevent aliasing
  // Cut off at slightly less than the Nyquist frequency of the target sample rate
  const filteredData = applyLowPassFilter(
    audioData,
    outputSampleRate * 0.45, // Slight margin below Nyquist frequency
    inputSampleRate
  );

  const ratio = inputSampleRate / outputSampleRate;
  const newLength = Math.floor(audioData.length / ratio);
  const result = new Int16Array(newLength);

  // Linear interpolation
  for (let i = 0; i < newLength; i++) {
    const position = i * ratio;
    const index = Math.floor(position);
    const fraction = position - index;

    if (index + 1 < filteredData.length) {
      const a = filteredData[index];
      const b = filteredData[index + 1];
      result[i] = Math.round(a + fraction * (b - a));
    } else {
      result[i] = filteredData[index];
    }
  }

  return result;
};
const SimliCharacter = memo((props: SimliCharacterProps) => {
    const videoRef = useRef(null)
    const audioRef = useRef(null)
    useEffect(() => {
        if(props.ttsAnalyzer&&simliClient.isConnected()){
            // Example: sending audio data (should be PCM16 format, 16KHz sample rate)
          //   const bufferLength = props.ttsAnalyzer.frequencyBinCount;
          //   const dataArray = new Uint8Array(bufferLength);
          //   console.log("dataArray",dataArray);
          // props.ttsAnalyzer.getByteTimeDomainData(dataArray);
          //     simliClient.sendAudioData(dataArray);
          
        }
      },[props.ttsAnalyzer])
    const eventListenerSimli = useCallback(() => {
        if (simliClient) {
          simliClient?.on("connected", () => {
            console.log("SimliClient connected");

            // Start sending audio data
            const audioData = new Uint8Array(6000).fill(0);
            simliClient?.sendAudioData(audioData);

            // const streamTrack = props.ttsAnalyzer.createMediaStreamDestination().stream;
            // console.log("streamTrack",streamTrack);
            // simliClient.listenToMediastreamTrack(streamTrack.getAudioTracks()[0]);


            // const audioData = new Uint8Array(6000).fill(0);
            // simliClient?.sendAudioData(props.ttsAnalyzer);
            // Start DailyBot interaction
            // connectDailyVoiceClient();
            console.log("Sent initial audio data");
          });

          simliClient?.on('speaking', () => {
            //TODO: This method is slow
            //   updateTtsState((s) => {
            //       s.isSpeaking = true
            //   })
          })

          simliClient?.on('silent', () => {
              updateTtsState((s) => {
                  s.isSpeaking = false
              })
          })
    
          simliClient?.on("disconnected", () => {
            console.log("SimliClient disconnected");
          });
        }
      }, []);
      const initializeSimliClient = useCallback(() => {
        console.log("API key:", props.simili_api_key);
        console.log("Face ID:", props.simli_faceid);
        if (videoRef.current && audioRef.current) {
          const SimliConfig = {
            apiKey: props.simili_api_key,
            faceID: props.simli_faceid,
            handleSilence: true,
            videoRef: videoRef,
            audioRef: audioRef,
            SimliURL:"s://api.simli.ai"
          };
    
          simliClient.Initialize(SimliConfig as any);
          console.log("Simli Client initialized");
        }
      }, [props.simli_faceid]);
      const handleStart = useCallback(async () => {
    
        try {
          initializeSimliClient();
    
          // Request microphone access
          await navigator.mediaDevices.getUserMedia({ audio: true });
    
          // Start Simli client
          await simliClient?.start();
          eventListenerSimli();
    
          // Initialize Daily Voice Client
        } catch (error: any) {
          console.error("Error starting interaction:", error);
        }
      }, []);  
      const handleStop = useCallback(() => {
        console.log("Stopping interaction...");
    
        // Clean up clients
        simliClient?.close();
    
        console.log("Interaction stopped");
      }, []);
    
      useEffect(() => {
        handleStart()
        return () => {
          handleStop();
        }
      }, []);
  return (
    <>
    <video style={{zIndex:100,width:"550px",height:"550px",backgroundColor:"black"}} ref={videoRef} autoPlay playsInline></video>
    <audio ref={audioRef} autoPlay playsInline></audio>
    </>
  )
})

export default SimliCharacter