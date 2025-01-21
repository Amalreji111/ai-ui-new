import styled, { keyframes } from "styled-components";

export const Container = styled.div`
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  background: linear-gradient(180deg, #3832A0 0%, #3832A0 40%, #000000 100%); /* Gradient flows from top to bottom, dark at footer */

    height: 100vh;
    width: 100vw;

`;
export const AnimationContainer = styled.div`
   position:absolute;
   top:0;
   width: 100%;
   height:20%;
`;
export const ImageContainer = styled.div`
    flex:0.4;
   width: 100%;
   height:200px;
   align-items: center;
   justify-content: center;
   overflow:hidden;
`
export const FooterContainer = styled.div`
   margin-top: 2%;
   width: 100vw;


`
export const QRContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  height: 72px;
  border-radius: 10px;
  margin-right: 35px;
  border-top-right-radius: 0px;
  border-bottom-right-radius:0px ;
  align-self: center;
  width: 100%;
  gap: 20px;
`;
export const QRText = styled.p`
color: white;
font-size: 16px;
line-height: 1.4;
margin: 0;
white-space: nowrap;
`;

export const ChatContainer = styled.div`
    
  display: flex;
  flex:0.1;
  align-items: center;
  justify-content: center;
  background: #f4f4f4;
  border-top: 1px solid #ddd;
  width: 100%;
`;

export const ChatInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  width:80%;
  outline: none;
  font-size: 16px;
  margin-right: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const SendButton = styled.button`
  background-color: #007bff;
  width:15%;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px ;
  align-self: center;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #0056b3;
  }

  &:active {
    background-color: #003d82;
  }
`;
export const TypeOverlayContainer = styled.div`
  background: transparent;
  color: white;
  min-height: 100px;
  max-height: 100px;
  height: 100px;
  max-width: 800px;
  width: 100%;
  font-size: 38px;
  letter-spacing: 0.2px;
  margin-top: 16px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  position: absolute;
  bottom: 22%;
  left: 50%;
  transform: translate(-50%, 0);
  overflow-y: hidden;
  z-index: 1000;
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

export const blink = keyframes`
0% { opacity: 1; }
50% { opacity: 0; }
100% { opacity: 1; }
`;
export const Cursor = styled.span`
  animation: ${blink} 1s infinite;
`;

export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

export const StyledText = styled.span`
  background: rgba(0, 0, 0, 0.9);
  text-align: center;
  padding: 0 10px;
`;
