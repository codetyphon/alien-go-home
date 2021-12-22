import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { init, screen, draw, key, on_next } from './lib/canvas'
import loader from './lib/loader'
import { Avatar, Button, CircularProgress, IconButton, LinearProgress, Modal } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ReplayIcon from '@mui/icons-material/Replay';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import MusicOffIcon from '@mui/icons-material/MusicOff';
import { isMobile } from "react-device-detect";
import KeyboardEventHandler from 'react-keyboard-event-handler';
import * as Welcome from "./welcome"

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [stages, setStages] = useState<any[]>([])
  const [stage, setStage] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)
  const [pass, setPass] = useState<boolean>(false)
  const [loadNextStage, setLoadNextStage] = useState<boolean>(false)
  const [musicOn, setMusicOn] = useState<boolean>(false)
  const [bgMusic, setBgMusic] = useState<HTMLAudioElement | null>(null)

  const [showWelcome, setShowWelcome] = useState<boolean>(true)

  const next = (stage: number) => {
    console.log(stage)
    if (stage == stages.length - 1) {
      //all stages passed
      console.log("all passed")
      setPass(true)
    } else {
      setLoadNextStage(true)
      setTimeout(() => {
        setLoadNextStage(false)
        const new_stage = stage + 1
        setStage(new_stage)
        screen(stages[new_stage], new_stage)
      }, 1500);
    }
  }

  const getStages = async () => {
    const rawResponse = await fetch('/stages.json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const content = await rawResponse.json();
    setStages(content)
  }

  const load = async () => {
    await getStages()
  }

  useEffect(() => {
    const audio = new Audio()
    audio.src = "/bg.mp3"
    audio.addEventListener('canplaythrough', function () {
      setBgMusic(audio)
    }, false);
    load()
  }, []);
  useEffect(() => {
    if (stages.length > 0) {
      // Initialize
      const size = isMobile ? 300 : 600
      const w = size, h = size
      setStage(0)
      if (canvasRef.current) {
        canvasRef.current.width = w
        canvasRef.current.height = h
        canvasCtxRef.current = canvasRef.current.getContext('2d');
        const ctx = canvasCtxRef.current; // Assigning to a temp variable
        loader([1, 2, 3, 8, 9], (images) => {
          if (ctx) {
            init(ctx, w, h, images, 50)
            const map = stages[stage]
            screen(map, stage)
            on_next(next)
            draw()
          }
        }, (progress) => {
          console.log('on_progress', progress)
          setProgress(progress * 100);
        })
      }
    }
  }, [stages]);
  return (
    <div className="App">
      <KeyboardEventHandler
        handleKeys={['w', 's', 'a', 'd', 'enter', 'r']}
        onKeyEvent={(k: any, e: any) => {
          switch (k) {
            case 'w':
              key.up()
              break;
            case 's':
              key.down()
              break;
            case 'a':
              key.left()
              break;
            case 'd':
              key.right()
              break;
            case 'r':
              screen(stages[stage], stage)
              break;
            case 'enter':
              break;
            default:
              break;
          }
        }} >
      </KeyboardEventHandler>
      <div className={`container ${isMobile ? "mobile" : "PC"}`}>
        <Modal
          open={pass}
          onClose={() => { }}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        ><div style={{
          width: "80vw", height: "30vh", display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          flexDirection: "column",
          padding: "10px",
          borderRadius: "5px"
        }}><h2>All Stages Passed</h2>
            <EmojiEventsIcon sx={{ fontSize: 120 }} htmlColor="#ffde5f" />
            <Button fullWidth onClick={() => {
              screen(stages[0], 0)
              setStage(0)
              setPass(false)
            }} variant="contained"><ReplayIcon />ReStart</Button>
            <p></p>
          </div></Modal>

        <Modal
          open={showWelcome}
          onClose={() => { }}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        ><div style={{
          width: "80vw", height: "30vh", display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          flexDirection: "column",
          padding: "10px",
          borderRadius: "5px"
        }}><h2>Welcome</h2>
            {isMobile ? <Welcome.mobile /> : <Welcome.pc />}
            <Button fullWidth onClick={() => {
              setShowWelcome(false)
            }} variant="contained"><PlayArrowIcon />ok</Button>
          </div></Modal>

        <Modal
          open={loadNextStage}
          onClose={() => { }}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        ><div style={{
          width: "80vw", height: "30vh", display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          flexDirection: "column",
          padding: "10px",
          borderRadius: "5px"
        }}><h2>stage {stage}</h2>

            <EmojiEventsIcon sx={{ fontSize: 120 }} htmlColor="#ffde5f" />
            <LinearProgress sx={{ width: "100%" }} />
          </div></Modal>
        <div className="stage">
          <div style={{ display: "flex", alignItems: "center" }}>
            {musicOn ? <IconButton size="large" color="primary" aria-label="up" component="span" onClick={() => {
              setMusicOn(false)
              bgMusic?.pause()
            }}>
              <MusicNoteIcon fontSize="large" />
            </IconButton> : <IconButton size="large" color="primary" aria-label="up" component="span" onClick={() => {
              setMusicOn(true)
              bgMusic?.play()
            }}>
              <MusicOffIcon fontSize="large" />
            </IconButton>}
          </div>
          <div>Stage {stage + 1} / {stages.length}</div>
        </div>
        <div className="box">
          <div className="screen">
            <canvas ref={canvasRef}>
            </canvas>
            <div className={`loading-pan ${progress == 100 ? "hide" : "show"}`}>
              <CircularProgress variant="determinate" value={progress} />
            </div>
          </div>
        </div>
        {isMobile &&
          <div className="ctrl">
            <div className="left">
              <div className="keys">
                <div className="row">
                  <div className="block"></div>
                  <div className="block">
                    <IconButton size="large" color="primary" aria-label="up" component="span" onClick={() => {
                      key.up()
                    }}>
                      <ArrowDropUpIcon fontSize="large" />
                    </IconButton>
                  </div>
                  <div className="block"></div>
                </div>
                <div className="row">
                  <div className="block">
                    <IconButton size="large" color="primary" aria-label="left" component="span" onClick={() => {
                      key.left()
                    }}>
                      <ArrowLeftIcon fontSize="large" />
                    </IconButton>
                  </div>
                  <div className="block"></div>
                  <div className="block">
                    <IconButton size="large" color="primary" aria-label="right" component="span" onClick={() => {
                      key.right()
                    }}>
                      <ArrowRightIcon fontSize="large" />
                    </IconButton>
                  </div>
                </div>
                <div className="row">
                  <div className="block">
                  </div>
                  <div className="block">
                    <IconButton size="large" color="primary" aria-label="down" component="span" onClick={() => {
                      key.down()
                    }}>
                      <ArrowDropDownIcon fontSize="large" />
                    </IconButton>
                  </div>
                  <div className="block">
                  </div>
                </div>
              </div>
            </div>
            <div className="right">
              <Button fullWidth onClick={() => {
                screen(stages[stage], stage)
              }} variant="contained"><ReplayIcon />RePlay</Button>
            </div>
          </div>}
      </div>
    </div>
  );
}

export default App;