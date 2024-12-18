# Query Params 

## animationFileName 
File path for the animation showing on the top header section. The file should located inside the r2 public url https://pub-95dde801fe1848caab87217ee3dc1307.r2.dev. File should be in JSON format. 
### example usage:
`` animationFileName=wave-animation ``

## animationHeight
Setting the height of the animation. The default value is 400.
### example usage:
`` animationHeight=500``

## qrTransferPapId
The pap id for showing the qrcode to transfer the chat.
### example usage:
`` qrTransferPapId=1733936970170-71c88996-4e8c-469d-a7ac-317fe4a9f9c8 ``
find qrTransferPapId in the end of PAP url after access-point-

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

