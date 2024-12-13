    // Function to convert the audio to WAV and check for silence
export const convertToWav = async (audioBlob) => {
    return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioData = new Uint8Array(reader.result);

        try {
        const buffer = await audioContext.decodeAudioData(audioData.buffer);
        
        // If no significant audio is detected, return null
        if (!containsSignificantAudio(buffer)) {
            resolve(null);
        } else {
            // Convert to WAV and return the blob if audio is valid
            const wavData = bufferToWave(buffer, buffer.length);
            const wavBlob = new Blob([wavData], { type: 'audio/wav' });
            resolve(wavBlob);
        }
        } catch (error) {
        reject(error);
        }
    };
    reader.readAsArrayBuffer(audioBlob);
    });
};

// Function to check if the audio contains significant sound
export const containsSignificantAudio = (audioBuffer, threshold = 0.3) => {
    const numOfChannels = audioBuffer.numberOfChannels;
    const channelData = [];

    for (let i = 0; i < numOfChannels; i++) {
    channelData.push(audioBuffer.getChannelData(i));
    }

    // Check each sample in each channel for significant sound
    for (let i = 0; i < channelData[0].length; i++) {
    for (let channel = 0; channel < numOfChannels; channel++) {
        if (Math.abs(channelData[channel][i]) > threshold) {
        return true; // There is significant sound
        }
    }
    }

    return false; // No significant sound detected
};

// Function to convert audio buffer to WAV format
export const bufferToWave = (abuffer, len) => {
    const numOfChannels = abuffer.numberOfChannels;
    const sampleRate = abuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16; // 16-bit PCM
    const byteRate = sampleRate * numOfChannels * (bitDepth / 8);
    const blockAlign = numOfChannels * (bitDepth / 8);
    const wavLength = 44 + len * blockAlign;
    const buffer = new ArrayBuffer(wavLength);
    const view = new DataView(buffer);

    // Write WAV header
    let offset = 0;
    const writeString = (str) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i) & 0xff);
        }
        offset += str.length;
    };

    // RIFF header
    writeString('RIFF');
    view.setUint32(offset, wavLength - 8, true); // file length
    offset += 4;
    writeString('WAVE'); // wave format

    // Format chunk
    writeString('fmt ');
    view.setUint32(offset, 16, true); // chunk length
    offset += 4;
    view.setUint16(offset, format, true); // format type
    offset += 2;
    view.setUint16(offset, numOfChannels, true); // channels
    offset += 2;
    view.setUint32(offset, sampleRate, true); // sample rate
    offset += 4;
    view.setUint32(offset, byteRate, true); // byte rate
    offset += 4;
    view.setUint16(offset, blockAlign, true); // block align
    offset += 2;
    view.setUint16(offset, bitDepth, true); // bits per sample
    offset += 2;

    writeString('data');
    view.setUint32(offset, len * blockAlign, true);
    offset += 4;

    for (let i = 0; i < len; i++) {
        for (let channel = 0; channel < numOfChannels; channel++) {
            const sample = abuffer.getChannelData(channel)[i];
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }

    return view;
};

export const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
};