import React, { memo } from 'react';
import {QRCodeSVG as ReactQrCode} from 'qrcode.react';
import styled from 'styled-components';

// Interface for component props
interface QrCodeGeneratorProps {
  url: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

const StyledQRCodeWrapper = styled.div<{ 
  $width?: number; 
  $height?: number; 
}>`
  display: inline-block;
  width: ${props => props.$width ? `${props.$width}px` : 'auto'};
  height: ${props => props.$height ? `${props.$height}px` : 'auto'};
`;

const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = memo(({
  url,
  width = 200,
  height = 200,
  style,
  errorCorrectionLevel = 'M'
}) => {

  return (
    <StyledQRCodeWrapper 
      $width={width} 
      $height={height}
      style={style}
    >
      <ReactQrCode 
      style={{
        zIndex: 100
      }}
        value={url} 
        
        size={Math.min(width, height)}
        level={errorCorrectionLevel}
      />
    </StyledQRCodeWrapper>
  );
});

export default QrCodeGenerator;