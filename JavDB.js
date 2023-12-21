[Script]
JavDB-净化/VIP = type=http-response,pattern=^https?:\/\/api\.hechuangxinxi\.xyz\/api\/v\d\/(users|startup|ads),requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/W126-L/QuantumultX/main/JavDB.js
JavDB-播放 = type=http-request,pattern=^https?:\/\/api\.hechuangxinxi\.xyz\/api\/v\d\/(movies\/.*\/play|startup),requires-body=0,max-size=0,script-path=https://raw.githubusercontent.com/W126-L/QuantumultX/main/JavDB.js

[MITM]
hostname = %APPEND% api.hechuangxinxi.xyz
