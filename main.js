const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const ffmpeg = require('fluent-ffmpeg');

// Global config
const maxWordCount = 10;
const videoLocation = '/your-file-location/video.mp4';

async function extractAudio(videoPath) {
  return new Promise((resolve, reject) => {
    const audioPath = videoPath.replace(/\.\w+$/, '.mp3'); // Change file extension to .mp3
    ffmpeg(videoPath)
      .output(audioPath)
      .audioCodec('libmp3lame') // Convert to mp3
      .on('end', () => resolve(audioPath))
      .on('error', reject)
      .run();
  });
}

async function transcribeAudio(audioPath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(audioPath));
  formData.append('timestamp_granularities[]', 'word');
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');

  const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
    headers: {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    }
  });

  console.log(response.data);

  return response.data;
}

function generateSrtContent(words) {
  let srtContent = "";
  let sentence = "";
  let sentenceStart = words[0].start;
  let sentenceEnd = words[0].end;
  let wordCount = 0;
  let currentIndex = 1;

  words.forEach((word, index) => {
    if (sentence === "") {
      sentenceStart = word.start;
      wordCount = 0;
    }

    sentence += word.word + " ";
    sentenceEnd = word.end;
    wordCount++;

    const nextWord = words[index + 1];
    if (!nextWord || (nextWord.start - word.end > 1.0) || wordCount >= maxWordCount) {
      srtContent += formatSrtBlock(currentIndex, sentence.trim(), sentenceStart, sentenceEnd);
      sentence = "";
      currentIndex++;
    }
  });

  return srtContent;
}

function formatSrtBlock(index, text, start, end) {
  return `${index}\n${formatTime(start)} --> ${formatTime(end)}\n${text}\n\n`;
}

function formatTime(seconds) {
  const baseDate = new Date(0);
  baseDate.setSeconds(seconds);
  const hours = baseDate.getUTCHours().toString().padStart(2, '0');
  const minutes = baseDate.getUTCMinutes().toString().padStart(2, '0');
  const secondsInt = baseDate.getUTCSeconds().toString().padStart(2, '0');
  const milliseconds = Math.floor((seconds - Math.floor(seconds)) * 1000).toString().padStart(3, '0');

  return `${hours}:${minutes}:${secondsInt},${milliseconds}`;
}

function generateSrtFile(transcriptionData, videoPath) {
  if (!transcriptionData || !transcriptionData.words) {
    console.error('Invalid transcription data received');
    return;
  }

  const words = transcriptionData.words;
  const srtContent = generateSrtContent(words);
  const srtPath = videoPath.replace(/\.\w+$/, '.srt'); // Change file extension to .srt

  fs.writeFileSync(srtPath, srtContent, 'utf8');
  console.log(`SRT file has been created and saved to: ${srtPath}`);
}


async function processVideo(videoPath) {
  try {
    const audioPath = await extractAudio(videoPath);
    const transcription = await transcribeAudio(audioPath);
    generateSrtFile(transcription, videoPath);
    console.log('SRT file has been created successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

processVideo(videoLocation);

