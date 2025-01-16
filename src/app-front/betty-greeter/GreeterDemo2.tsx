import React, { memo, useEffect, useRef, useState } from 'react'
import { AnimationContainer, ChatContainer, ChatInput, Container, Cursor, FooterContainer, ImageContainer, QRContainer, QRText, SendButton, StyledText, TextContainer, TypeOverlayContainer } from './GreeterStyle'
import Lottie from 'react-lottie';
import { convertToBoolean, getQueryParam, getQueryParamAsNumber } from './utils/utils';
import SimliCharacter from './components/SimliCharacter';
import { getTtsState } from '../../tts/TtsState';
import { CharacterAvatar } from '../../ui/character/CharacterAvatar';
import { useCurrentChat } from '../../ui/chat/useCurrentChat';
import { useAppState } from '../../state/app/AppState';
import useTranscription from './hooks/useTranscription';
import { DataObjectStates } from '../../state/data-object/DataObjectStates';
import { isDefined } from '@mjtdev/engine';
import intelliageImage from './assets/intelligage.png';
import QrCodeGenerator from './components/QrCode';
import { AsrCustoms } from '../../asr-custom/AsrCustoms';
import { Ttss } from '../../tts/Ttss';
import { ChatStates } from '../../state/chat/ChatStates';
import SendIcon from "./assets/send_icon.png"
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
const GreeterDemo2 = () => {
    const { chat } = useCurrentChat();
    const { ttsEnabled } = useAppState();
    const {  parseResult,lastMessageTimestamp ,setTranscription} = useTranscription();
    const enable3dCharacter = getQueryParam("enable3dCharacter", "true");
    const characterBackground = getQueryParam("characterBackground", "transparent");
    const [qrCodeUrl,setQrCodeUrl]=useState('https://ai-workforce.intelligage.net/access-point-1733936970170-71c88996-4e8c-469d-a7ac-317fe4a9f9c8')
    const animationFileName = getQueryParam("animationFileName", "wave-animation");
    const animation =`${__R2_BUCKET_ASSET_URL__}/${animationFileName}.json`
    const outerBackground = getQueryParam("outerBackground", "3832A0");
  const searchParams = new URLSearchParams(window.location.search);
  const { audioContext } = getTtsState();

  const userChatRef = useRef<HTMLInputElement>(null);

  const handleSubmitUserChat = (event: React.FormEvent) => {
    event.preventDefault();

    // Retrieve the value from the input field
    if (userChatRef.current) {
      const message = userChatRef.current.value;
      console.log("User Message:", message);
    ChatStates.addChatMessage({ chat, text: message });

      // Clear the input field after submission
      userChatRef.current.value = '';
    }
  };
  const ttsAnalyzer = audioContext?.createAnalyser();

  const animate = searchParams.get('animate') === 'true';
  const characters = DataObjectStates.useDataObjectsById<"app-character">(
    [chat?.aiCharacterId, chat?.userCharacterId].filter(isDefined)

  )
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
            justifyContent:'center',
            width: "100%",
            height: "100%",
           }}
           style={{
            borderWidth:0,
            width: "100%",
            justifyContent:'center',
            position: 'relative',
            // top:"20%",
            left:0,
            height: "100%",
            background:characterBackground??"transparent",

           }}
           
          character={aiChar}
          showName={false}
          show3dAvatar={convertToBoolean(enable3dCharacter)}
          showContextMenu={false}
          enableDocumentDrop={false}
          
          avatar3dCanvasHeight={500}
          avatar3dCanvasWidth={500}
        analyserNode={ttsAnalyzer}
          
        />
       
      ) : undefined;
  
      useEffect(() => {
        AsrCustoms.startCustomAsr();
      
       return () => {
        AsrCustoms.stopVadAsr();
       }
    
      }, []);
    
      if (!ttsEnabled) {
        Ttss.enableTts();
      }
  
    
  return (
    <Container style={{backgroundColor: outerBackground}}>
        <AnimationContainer>
          
          <Lottie 
             speed={0.5}
             isStopped={!animate}
           options={{
           loop: true,
           autoplay: true,
           path: animation,
           rendererSettings: {
             preserveAspectRatio: "xMidYMid slice"
           }
         }}
           height={"100%"}
           width={"100%"}
         /> 
        </AnimationContainer>
        <ImageContainer>{avatar}</ImageContainer>
        <FooterContainer>
        <div style={{
  alignSelf: 'center',

        }}>
            <img src={intelliageImage} height={20} width={100} alt="Intelligage" />
          </div>

          <QRContainer>
            <QrCodeGenerator  url={qrCodeUrl} height={70} width={70}/>
            {/* <QRCode src={qrCodeImage} alt="QR Code" /> */}
            <QRText>
              Scan to continue on
              <br />
              your phone
            </QRText>
          </QRContainer>
        <ChatContainer>
          <form style={{width:"100%",display:"flex"}}onSubmit={handleSubmitUserChat}>
          <ChatInput
               ref={userChatRef}
               type="text"
               name="userMessage"
               placeholder="Type your message..." />
          <SendButton  type={'submit'}>
            <img src={SendIcon} height={20} width={20} alt="Send" />
          </SendButton>
          </form>

</ChatContainer>
        </FooterContainer>
        <TypingOverlay text={parseResult?.strippedText?.trim() ?? ""} />

    </Container>
  )
}

export default GreeterDemo2