# Video to SRT Converter

This Node.js application extracts audio from a video file, transcribes the audio, and generates a corresponding SRT (SubRip subtitle) file. It leverages the OpenAI Whisper model for transcription through the OpenAI API.

## Configuration

- `maxWordCount`: The maximum number of words per subtitle block.
- `videoLocation`: The path to the video file you want to process.

## Dependencies

This project uses the following main libraries:
- `fs` for file system operations.
- `axios` for HTTP requests.
- `FormData` for building form data objects.
- `fluent-ffmpeg` for handling video and audio processing.

Ensure you have FFmpeg installed on your system to use `fluent-ffmpeg`.

## Setup

1. **Install Node.js**: Ensure Node.js is installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).

2. **Clone the repository**: Clone this repository to your local machine using:
   ```bash
   git clone <repository-url>
   ```

3. **Install dependencies**: Navigate to the project directory and run:
   ```bash
   npm install
   ```

4. **Environment Variables**: Set the `OPENAI_API_KEY` environment variable with your OpenAI API key:
   ```bash
   export OPENAI_API_KEY='your_openai_api_key_here'
   ```

5. **Configuration**: Adjust the `videoLocation` and `maxWordCount` in the script as needed.

## Usage

To process a video and generate an SRT file, run the script using:
```bash
node index.js
```

This will execute the `processVideo` function with the specified video location, extract the audio, transcribe it, and generate an SRT file in the same directory as the video.

## Functions

### `extractAudio(videoPath)`
Extracts the audio from the specified video file and saves it as an MP3 file in the same directory.

### `transcribeAudio(audioPath)`
Transcribes the extracted audio using the OpenAI Whisper model and returns the transcription data in verbose JSON format.

### `generateSrtContent(words)`
Generates the content of an SRT file from the transcription data, splitting sentences based on the maximum word count or pauses in speech.

### `generateSrtFile(transcriptionData, videoPath)`
Generates and saves an SRT file using the transcription data and the path of the original video file.

### `processVideo(videoPath)`
Coordinates the process of extracting audio, transcribing it, and generating an SRT file for the specified video.
