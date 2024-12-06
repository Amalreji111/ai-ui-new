import React, { memo, useEffect, useRef, useState } from 'react';
import styled,{ keyframes } from 'styled-components';

// Import your assets here
import qrCodeImage from './assets/qrcode.png';
import intelliageImage from './assets/intelligage.png';
import { useIsTtsSpeaking } from '../../tts/useIsTtsSpeaking';
import { getTtsState } from '../../tts/TtsState';
import { useCurrentChat } from '../../ui/chat/useCurrentChat';
import { getCustomAsrState } from '../../asr-custom/updateCustomAsrState';
import { AsrCustoms } from '../../asr-custom/AsrCustoms';
import { Ttss } from '../../tts/Ttss';
import { useAppState } from '../../state/app/AppState';
import useTranscription from './hooks/useTranscription';
import { DataObjectStates } from '../../state/data-object/DataObjectStates';
import { CharacterAvatar } from '../../ui/character/CharacterAvatar';
import useFaceDetection from './hooks/faceDetection';
import Lottie from "react-lottie"
import animationData from "./assets/wave-animation.json"
import FaceIcon from './components/FaceIcon';
import ListeningIcon from './components/ListeningIcon';
import { isDefined } from '@mjtdev/engine/packages/mjtdev-object';
import {  useFaceDetectionNew } from './hooks/useFacedetection-new';
// import { useFaceDetection as useFaceDetectionNew } from './hooks/facedetection-new1';
import { ChatStates } from '../../state/chat/ChatStates';
import { convertToBoolean, getQueryParam, getQueryParamAsNumber } from './utils/utils';
import CameraIcon from './components/Camera';
import { ChatDebugDisplay } from '../../ui/chat/mind/ChatDebugDisplay';
import QrCodeGenerator from './components/QrCode';
import { useChatSummary } from './hooks/useSummary';
// width: 100%;


const Container = styled.div`
  height: 100%;
  background: linear-gradient(180deg, #5046E5 0%, #3832A0 20%, #000000 100%); /* Gradient flows from top to bottom, dark at footer */
  margin:40px;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
`;

const Frame = styled.div`
  position: relative;
  width: 100vw;
  height: 100%;
  background:black;

`;

const WaveAnimation = styled.div`
  
  width: 100%;
  height: 35%;
  opacity: 0.8;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Content = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* Moves content closer to the footer */
  flex: 1;
  background: linear-gradient(180deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,1) 100%);
`;

const ImageContainer = styled.div`
  position: absolute; /* Changed from absolute */
  width: 100%;
  height: auto;
  top:-70;
  display:flex;
  align-items:center;
  justify-content:center;
  margin-bottom: 2%; /* Spacing between image and footer */
  
  @media (max-width: 768px) {
    max-width: 320px;
  }
`;

const AssistantImage = styled.div`
  position: absolute;
  width: 100%;

  top:-100%;
  left:0;
  height: auto;
`;

const Footer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  height: 150px;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: #000;

  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px;
  }
  margin-bottom: 50px;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;

  img {
    height: 66px;
    width: auto;

    @media (max-width: 768px) {
      height: 28px;
    }
  }
`;

const QRContainer = styled.div`
  display: flex;
  align-items: center;
  position:absolute;
  border-radius: 10px;
  margin-right: 10px;
  right: -50;
  padding-right: 45px;
  border-top-right-radius: 0px;
  border-bottom-right-radius:0px ;

  align-self: end;
  background:#FFFFFF1A;
  gap: 12px;
`;
const Overlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%; /* overlay cover 50% of the container height */
  background: linear-gradient(to top, rgba(11, 11, 11, 01), rgba(0, 0, 0, 0));
  border-radius: inherit;
  overflow: hidden;
`;

const QRCode = styled.img`
  width: 125px;
  height: 125px;
  border-radius: 20px;
  padding:16px;

  @media (max-width: 768px) {
    width: 125px;
    height: 125px;
  }
`;

const QRText = styled.p`
  color: white;
  font-size: 24px;
  line-height: 1.4;
  margin: 0;
  white-space: nowrap;
`;

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`;

const TypeOverlayContainer = styled.div`
  background: transparent;
  color: white;
  min-height: 100px;
  max-height: 200px;
  max-width: 800px;
  width: 100%;
  font-size: 38px;
  letter-spacing: 0.2px;
  margin-top: 16px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  position: absolute;
  bottom: 18%;
  left: 50%;
  transform: translate(-50%, 0);
  overflow-y: auto;
  scrollbar-width: none; // Firefox
  -ms-overflow-style: none; // IE and Edge

  // Hide scrollbar for Chrome/Safari
  &::-webkit-scrollbar {
    display: none;
  }

  // Ensure text wraps properly
  white-space: pre-wrap;
  word-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 16px;
    max-height: 150px;
  }
`;

const Cursor = styled.span`
  animation: ${blink} 1s infinite;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const StyledText = styled.span`
  background: rgba(0, 0, 0, 0.9);
  text-align: center;
  padding: 0 10px;
`;

const StatusIconContainer = styled.div`
display: flex;
`
const DebugDisplayContainer = styled.div`
  position: absolute;
  top: 5%;
  left: 10%;
  height:80%;
  color:white;
  z-index: 1000;
  //white transparent background
  background: rgba(255, 255, 255, 0.5);
`;

const TypingOverlay = memo(
  ({ text, typingSpeed = 40 }: { text: string; typingSpeed?: number }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // Reset when new text comes in
      setDisplayedText("");
      setCurrentIndex(0);
    }, [text]);

    useEffect(() => {
      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setDisplayedText((prev) => prev + text[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        }, typingSpeed);

        return () => clearTimeout(timer);
      }
    }, [currentIndex, text, typingSpeed]);
    useEffect(() => {
      if (containerRef.current) {
        const container = containerRef.current;
        container.scrollTop = container.scrollHeight;
      }
    }, [displayedText]);
    return (
      <TypeOverlayContainer ref={containerRef}>
        <TextContainer>
          <StyledText>
            {displayedText}
            <Cursor>|</Cursor>
          </StyledText>
        </TextContainer>
      </TypeOverlayContainer>
    );
  }
);

const IntelligageScreen: React.FC = memo(() => {
  const { chat } = useCurrentChat();
  const { ttsEnabled } = useAppState();
  const {  parseResult,lastMessageTimestamp ,setTranscription} = useTranscription();
  const noFaceDetectionTimer = getQueryParamAsNumber("noFaceDetectionTimer", 15);
  const enableFacedetectionTimer = getQueryParamAsNumber("noVoiceActivityTimer", 35)*1000;
  const enable3dCharacter = getQueryParam("enable3dCharacter", "true");
  const characterBackground = getQueryParam("characterBackground", "transparent");

  let summary = useChatSummary(chat);
  const QR_CODE_URL = `https://ai-workforce.intelligage.net/access-point-1731431369995-8101bbef-c774-4422-9e62-01f2c0c1ea12?summary=${summary}`;
  // const QR_CODE_URL=' https://ai-workforce.intelligage.net/access-point-1733145816811-31963650-dd94-4552-b2e9-7af5d5946a48'
  // console.log(summary,"Summary")
  const { webcamRef, detected, isCameraActive ,disableDetection,enableDetection} = useFaceDetectionNew({
    minDetectionConfidence: 0.5,
    model: "short"
  });
  const noFaceTimeout = useRef<NodeJS.Timeout | null>(null);
  const isCooldown = useRef<boolean>(false);
  const faceDetectionActivationTimer = useRef<NodeJS.Timeout | null>(null);
  const GREETING_TIMEOUT = noFaceDetectionTimer*1000; // 10 seconds
  const characters = DataObjectStates.useDataObjectsById<"app-character">(
    [chat?.aiCharacterId, chat?.userCharacterId].filter(isDefined)

  )
 const {speaking} =getCustomAsrState()
 const ttsSpeaking = useIsTtsSpeaking();

useEffect(() => {
  /**
   * Logic:
   * 1) If either TTS or speaking is active:
   *    - Clear any existing timer
   *    - Reset the timer ref
   * 2) If both are inactive:
   *    - Clear any existing timer (to avoid multiple timers)
   *    - Start a new timer
   *    - After timeout, enable face detection
   */
  
  // Clear any existing timer first
  if (faceDetectionActivationTimer.current) {
    clearTimeout(faceDetectionActivationTimer.current);
    faceDetectionActivationTimer.current = null;
  }

  // If neither TTS nor speaking is active, start the timer
  if (!ttsSpeaking && !speaking) {
    faceDetectionActivationTimer.current = setTimeout(() => {
      console.log("enabling face detection");
      enableDetection();
    }, enableFacedetectionTimer);
  }

  // Cleanup on unmount or when dependencies change
  return () => {
    if (faceDetectionActivationTimer.current) {
      clearTimeout(faceDetectionActivationTimer.current);
      faceDetectionActivationTimer.current = null;
    }
  };
}, [ttsSpeaking, speaking, enableDetection]);
//  useEffect(() => {
//   const enableFaceDetection = getQueryParam("enableFacedetection", "true");
//   if (convertToBoolean(enableFaceDetection)) {
//     enableDetection();
//   }
//  },[])
 
  // const { faceDetected ,videoRef} = useFaceDetection();

  // const attentionState = useScreenAttention(faceDetected)
  const { audioContext } = getTtsState();
  const greetUser = () => {
    console.log("Hello! New face detected!");
    ChatStates.addChatMessage({ chat, text: "Hi" });

    // Your greeting logic goes here
  };
  useEffect(() => {
    if (!detected) {
      // If a timeout already exists, clear it to avoid multiple timers
      if (noFaceTimeout.current) clearTimeout(noFaceTimeout.current);

      // Start a new timeout for 10 seconds when no face is detected
      noFaceTimeout.current = setTimeout(() => {
        console.log(`No face detected for ${noFaceDetectionTimer} seconds. Ready to greet a new face.`);
        isCooldown.current = false; // Reset the cooldown status
      }, GREETING_TIMEOUT);
    } else {
      // If a face is detected and cooldown is false, greet the user
      if (!isCooldown.current) {
        greetUser();
        disableDetection();
        isCooldown.current = true; // Enable cooldown to prevent multiple greetings
      }

      // Clear the timeout if a face is detected
      if (noFaceTimeout.current) clearTimeout(noFaceTimeout.current);
    }
  }, [detected]);

//enable face detection if detect no voice activity for atleast 5 seconds. define seconds in a variable

  
  const ttsAnalyzer = audioContext?.createAnalyser();
  //access query param using 
  const searchParams = new URLSearchParams(window.location.search);
  const animate = searchParams.get('animate') === 'true';

  // Example: Get a query parameter named "id"
  // const faceDetectionTimer = parseInt(searchParams.get("face-detection-timer")??'15');

  const aiChar = chat?.aiCharacterId?characters.find(x=>x.id===chat.aiCharacterId):undefined
  const character=chat?.userCharacterId
      ? characters.find(x=>x.id===chat.userCharacterId)
      : undefined;
      const avatar = character ? (
        <CharacterAvatar
          hoverActions={["Chat With {char}"]}
          showHoverButtons={false}
          imageStyle={{
            objectFit: 'cover',
            width: "100px",
            height: "800px"
           }}
           style={{
            borderWidth:0,
            width: "1000px",
            height: "800px",
            background:characterBackground??"transparent",

           }}
           
          character={aiChar}
          showName={false}
          show3dAvatar={convertToBoolean(enable3dCharacter)}
          showContextMenu={false}
          enableDocumentDrop={false}
        analyserNode={ttsAnalyzer}
          
        />
      ) : undefined;
  
      
  
  if (!ttsEnabled) {
    Ttss.enableTts();
  }
  



  AsrCustoms.startCustomAsr();

  return (
    <Frame>
       {chat&&<DebugDisplayContainer>
            <ChatDebugDisplay chat={chat} isPerfChecked={true}/>
          </DebugDisplayContainer> }
      <Container>
        <WaveAnimation>
          
       <Lottie 
          speed={0.5}
          isStopped={!animate}
	    options={{
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      }}
        height={400}
        // width={400}
      /> 
        </WaveAnimation>
        <Content style={{ position: "relative" }}>
        <StatusIconContainer>
          <FaceIcon isActive={detected} />
          <ListeningIcon isActive={speaking} />
          <CameraIcon isActive={isCameraActive} />
          </StatusIconContainer>

          <ImageContainer style={{background:characterBackground??"transparent"}}>
            {avatar}
            {/* <Overlay></Overlay> */}
          </ImageContainer>

          <TypingOverlay text={parseResult?.strippedText?.trim() ?? ""} />

        </Content>
        <video 
        ref={webcamRef}
        autoPlay 
        playsInline
        muted
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '200px',
          height: '200px',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
        <Footer>
          <LogoContainer>
            <img src={intelliageImage} alt="Intelligage" />
          </LogoContainer>

          <QRContainer>
            <QrCodeGenerator url={QR_CODE_URL}/>
            {/* <QRCode src={qrCodeImage} alt="QR Code" /> */}
            <QRText>
              Scan to continue on
              <br />
              your phone
            </QRText>
          </QRContainer>
        </Footer>
      </Container>
    </Frame>
  );
});

export default IntelligageScreen;
