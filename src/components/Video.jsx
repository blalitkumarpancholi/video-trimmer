// src/App.jsx or src/App.tsx
import React, { useState , useRef} from 'react';
import ReactPlayer from 'react-player';
import { VideoToFrames,VideoToFramesMethod } from './VideoToFrame.ts';
import { FFmpeg} from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile, } from "@ffmpeg/util";
import * as helpers from '../utils/helpers.js'
import RangeInput from './RangeInput.js';

function Video() {
  const [videoURL, setVideoURL] = useState(null);
  const [inputVideoFile, setInputVideoFile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading,setLoading] = useState(false) 
  const [loaded, setLoaded] = useState(false);
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const messageRef = useRef(null);
  const [showTrimVideo,setShowTrimVideo] = useState(false)
  const [rStart, setRstart] = useState(0);
  const [rEnd, setRend] = useState(10);
  const videoRef = useRef(null)
  const [thumbnailIsProcessing, setThumbnailIsProcessing] = useState(false);
  const [videoMeta, setVideoMeta] = useState(null);
  const [thumbNails,setThumbNails] = useState([])
  const [trimVideo,setTrimVideo] = useState(null)
  const ffmpegRef = useRef(new FFmpeg())


  const load = async () => {
    setLoaded(true)
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd'
    const ffmpeg = ffmpegRef.current
    ffmpeg.on('log', ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message
    })
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    })
  }

  // const transcode = async () => {
  //   await load()
  //   setShowTrimVideo(false)
  //   let startTime = ((rStart/100) * videoMeta.duration).toFixed(0)
  //   let offsetTime = ((rEnd/100) * videoMeta.duration).toFixed(0)
  //   const ffmpeg = ffmpegRef.current
  //   console.log(helpers.toTimeString(startTime))
  //   console.log(helpers.toTimeString(offsetTime))
  //   // u can use 'https://ffmpegwasm.netlify.app/video/video-15s.avi' to download the video to public folder for testing
  //   await ffmpeg.writeFile('input.mp4', await fetchFile(videoURL))
  //   await ffmpeg.exec(['-i', 'input.mp4','-ss',helpers.toTimeString(startTime), '-t',helpers.toTimeString(offsetTime),'output.mp4'])

  //   const data = (await ffmpeg.readFile('output.mp4'))
  //   if (videoRef.current)
  //   setTrimVideo(URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' })))
  //     setLoaded(false)
  //     setShowTrimVideo(true)

    
  // }

  const transcode = async () => {
    setTrimVideo(null)
    setLoaded(true)
    await load();
    setShowTrimVideo(false);
  
    const startTime = (rStart / 100) * videoMeta.duration;
    const duration = ((rEnd - rStart) / 100) * videoMeta.duration;
  
    const ffmpeg = ffmpegRef.current;
  
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoURL));
    await ffmpeg.exec([
      '-ss', 
      String(startTime), 
      '-i', 
      'input.mp4',
      '-t',
       String(duration), 
       "-c",
       "copy",
       'output.mp4'
    ]);
  
    const data = await ffmpeg.readFile('output.mp4');
    if (videoRef.current) {
      setTrimVideo(URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' })));
    }
  
    setLoaded(false);
    setShowTrimVideo(true);
  };

  const handleVideoChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setInputVideoFile(file)
        setLoading(true)
      const videoURL = URL.createObjectURL(file);
      setVideoURL(videoURL);
      const frames = await VideoToFrames.getFrames(
        videoURL,
        15,
        VideoToFramesMethod.totalFrames
      );

      setLoading(false)
     setImages(frames);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      setLoading(true);
      setInputVideoFile(file)
      const videoURL = URL.createObjectURL(file);
      setVideoURL(videoURL);
      const frames = await VideoToFrames.getFrames(
        videoURL,
        15,
        VideoToFramesMethod.totalFrames
      );

      setLoading(false);
      setImages(frames);
    }
  };
  
  const now = new Date().toDateString();

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleLoadedData = async (e) => {
    // console.dir(ref.current);
   console.log('1')
    const el = e.target;
    const meta = {
      name: inputVideoFile.name,
      duration: el.duration,
      videoWidth: el.videoWidth,
      videoHeight: el.videoHeight
    };
    console.log({ meta });
    setVideoMeta(meta);
    const thumbNails = await VideoToFrames.getFrames(
      videoURL,
      15,
      VideoToFramesMethod.totalFrames
    );
    console.log(thumbNails)
    setThumbNails(thumbNails);
  };

  const handleUpdateRange = (func) => {
    return ({ target: { value } }) => {
      func(value);
    };
  };

  

  return (
    <>
    <div className="App min-h-screen flex flex-col items-center justify-center bg-white-low py-10 main-transition"
    onDrop={handleDrop}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    >
        {dragging && 
        <div className='min-h-screen w-screen absolute bg-purple-800  left-0 top-0 flex justify-center items-center main-transition'>
          <div className='text-white text-center lg:text-5xl md:text-4xl sm:text-2xl text-xl  font-bold mb-4'>Drop any where</div>
        </div>
        }
      {!videoURL &&  
      (
      <>
      <div className='text-slate-900 text-center 2xl:text-[5rem] xl:text-[4rem] lg:text-5xl md:text-4xl sm:text-2xl text-xl  font-bold mb-4'>Trim Video API</div>
      <div className='text-center mb-20 lg:text-xl sm:text-base text-gray-400 font-semibold'>Fast, accurate video trimmer. Try it below</div>
      <div className="max-w-lg flex flex-col w-full p-36 bg-img rounded-lg border-4 border-white shadow-lg" 
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}>
        <input
          type="file"
          accept="video/*,.mkv,.avi"
          onChange={handleVideoChange}
          className="my-2 hidden"
          ref={fileInputRef}  
        />

        <button className='px-5 py-4 bg-purple-700 text-white font-semibold text-lg rounded-md flex justify-center space-x-2 hover:bg-purple-900' onClick={handleButtonClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        > <span>Start from a Video</span></button>
        <div className='text-center text-slate-800 font-semibold mt-5'>Or drop a video here</div>
      </div>
      </>
      )}

      {loading === true && !videoURL && (
        <div className="h-1/4 shimmer-effect p-6 rounded-xl shadow-lg bg-white w-1/2 ">
      </div>
      )}
<div className="flex space-x-5 justify-center">
      {videoURL  &&(
          <div className="custom-player-container  flex justify-center p-6 rounded-xl shadow-lg bg-white w-1/2">
            <video src={videoURL} ref={videoRef} width={'100%'} height={'100%'} controls onLoadedMetadata={handleLoadedData}></video>
          </div>
        )}


{videoURL && <div className='custom-player-container  flex items-center p-6 rounded-xl flex-col shadow-lg bg-white w-1/2'>
{!trimVideo && loaded && <div className='w-1/2 shimmer-effect bg-gray-400'></div>}
        {trimVideo && <>
          <video src={trimVideo} className='' controls></video>
        <button
        onClick={()=>{helpers.download(trimVideo,inputVideoFile.name)}}
        className="bg-purple-700 hover:bg-purple-900 text-white py-3 px-6 mt-4 rounded flex space-x-2"
      >
        <span>Download ⬇️</span>
      </button>
      </>}
      </div>}
        </div>

{images?.length <=0 && loading === true && (
  <div className="output flex overflow-x-scroll mt-5 mx-44 space-x-3">
    <div className='w-44 rounded-md h-20 shimmer-effect bg-gray-400'></div>
    <div className='w-44 rounded-md h-20 shimmer-effect bg-gray-400'></div>
    <div className='w-44 rounded-md h-20 shimmer-effect bg-gray-400'></div>
    <div className='w-44 rounded-md h-20 shimmer-effect bg-gray-400'></div>
    <div className='w-44 rounded-md h-20 shimmer-effect bg-gray-400'></div>
    <div className='w-44 rounded-md h-20 shimmer-effect bg-gray-400'></div>
    <div className='w-44 rounded-md h-20 shimmer-effect bg-gray-400'></div>
  </div>
)}

{videoURL && <RangeInput
rEnd={rEnd}
rStart={rStart}
handleUpdaterEnd={handleUpdateRange(setRend)}
handleUpdaterStart={handleUpdateRange(setRstart)}
loading={thumbnailIsProcessing}
videoMeta={videoMeta}
thumbNails={thumbNails}
/>}

{/* <p ref={messageRef}></p> */}

{ images?.length > 0 && <button
        onClick={transcode}
        className="bg-purple-700 hover:bg-purple-900 text-white py-3 px-6 mt-10 rounded flex space-x-2"
      >
        <span>Trim Video ✂️</span>
      </button>}

    </div>
    </>
  );
}

export default Video;
