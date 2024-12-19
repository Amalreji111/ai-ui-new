# Query Params 

## animationFileName 
File path for the animation showing on the top header section. The file should located inside the r2 public url https://pub-95dde801fe1848caab87217ee3dc1307.r2.dev. File should be in JSON format. 
### example usage:
`` animationFileName=wave-animation ``

## enableFacedetectionTimer
The time for which face detection will be enabled when no voice is detected. The default value is 35 seconds.

### example usage:  
`` enableFacedetectionTimer=35 ``

## enableFacedetection
The boolean value for enabling face detection. The default value is true.
### example usage:
`` enableFacedetection=true ``

## noFaceDetectionTimer
The time duration for which the system tracks the absence of face to determine that no user is present.

### example usage:
`` noFaceDetectionTimer=15 ``

## companyLogo
The path for showing the company logo. The file should located inside the r2 public url https://pub-95dde801fe1848caab87217ee3dc1307.r2.dev. File should be in png format.
### example usage:
`` companyLogo=cutx-bank-logo ``


## animationHeight
Setting the height of the animation. The default value is 400.
### example usage:
`` animationHeight=500``

## animationWidth
Setting the width of the animation. The default value is 1000.
### example usage:
`` animationWidth=1000``

## qrTransferPapId
The pap id for showing the qrcode to transfer the chat.
### example usage:
`` qrTransferPapId=1733936970170-71c88996-4e8c-469d-a7ac-317fe4a9f9c8 ``
find qrTransferPapId in the end of PAP url after access-point-


## similiPreviewPath 
The path for showing the simili preview. The file should located inside the r2 public url https://pub-95dde801fe1848caab87217ee3dc1307.r2.dev. File should be in mp4 format.
### example usage:
`` similiPreviewPath=simli-violet-preview ``

## isSimliEnabled
The boolean value for using the simli service. The default value is false.
If isSimliEnabled false the default 3d character will be shown.
### example usage:
`` isSimliEnabled=true ``

## simliFaceId
The face id for using the simli service. The default value is e4b0ecec-6af1-4cd6-a870-ad490d0a6270.
### example usage:
`` simliFaceId=e4b0ecec-6af1-4cd6-a870-ad490d0a6270 ```` 


## characterBackground
The colour  for the character background. The default value is transparent. For hex code use %23 followed by the hex code
### example usage:
`` characterBackground=%233532B0 ``

## outerBackground
The colour  for the outer background. The default value is 3832A0. For hex code use %23 followed by the hex code
### example usage:
`` outerBackground=%233532B0 ``

# / Params
## access points
Pass the access points into the url in the following format to replace the character.
### example usage:
`` <domain of greeter>/access-point-1732810105505-839046aa-cfba-4236-a863-7895cbf41ebf``
Find the access point in the end of the PAP url.


# #params
## Debug
Pass debug as a hash param to show the debug screen for analysing performance.
### example usage:
`` <greeter domain>#debug``

