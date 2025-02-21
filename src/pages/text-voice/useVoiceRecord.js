import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/plugins/record";


function useVoiceRecord() {
  // Create an instance of WaveSurfer
  const recordRef = useRef(null);
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    const ws = WaveSurfer.create({
      ...default_wave_surfer_config,
      container: "#hiddenContainer",
    });
    recordRef.current = ws.registerPlugin(RecordPlugin.create());
    // Render recorded audio
    recordRef.current.on("record-end", (blob) => {
      let reader = new FileReader();
      const recordedUrl = URL.createObjectURL(blob);
      // Create wavesurfer from the recorded audio
      reader.onloadend = () => {
        setRecordings((prev) => [
          ...prev,
          { result: reader.result, recordedUrl, id: Date.now() },
        ]);
        // You can upload the base64 to server here.
      };

      reader.readAsDataURL(blob);
    });
    return () => {
      ws.destroy();
    };
  }, []);

  const isRecording = !!recordRef.current?.isRecording();

  return {
    recordRef,
    recordings,
    setRecordings,
    isRecording,
    HiddenRecorder: () => {
      return <div id="hiddenContainer" className="hidden" />;
    },
  };
}

export default useVoiceRecord;

export const default_wave_surfer_config = {
    waveColor: "rgba(149, 152, 152, 1)",
    progressColor: "rgba(100, 100, 100, 1)",
    // Set a bar width
    barWidth: 5,
    // Optionally, specify the spacing between bars
    barGap: 5,
    // And the bar radius
    barRadius: 10,
    cursorWidth: 0,
  };

/**
 *  USAGE INSTRUCTION
 * 
 * .....
      <HiddenRecorder/>
      <button
        onClick={() => {
          if (isRecording) {
            recorder.stopRecording();
            return;
          }
          setButtonCondition(true);

          recorder.startRecording().then(() => {
            setButtonCondition(false);
          });
        }}
        disabled={buttonCondition}
      >
        {isRecording ? "Stop" : "Start"}
      </button>
      .....
 */

