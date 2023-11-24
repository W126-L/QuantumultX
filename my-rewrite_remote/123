/***********************************************
> 使用说明：请在本地添加分流 host, ad.12306.cn, direct
> 原作者：墨鱼
[rewrite_local]
^https?:\/\/ad\.12306\.cn\/ad\/ser\/getAdList url script-analyze-echo-response https://raw.githubusercontent.com/W126-L/QuantumultX/main/12306.js

[mitm]
hostname = ad.12306.cn
***********************************************/

const version = 'V1.0.22';

var obj=JSON.parse($request.body),W126-L={};"0007"==obj.placementNo?(W126-L.materialsList=[{billMaterialsId:"6491",filePath:"W126-L",creativeType:1}],W126-L.advertParam={skipTime:1},W126-L.code="00"):W126-L="G0054"==obj.placementNo?{code:"00",materialsList:[{}]}:{code:"00",message:"无广告返回"},$done({body:JSON.stringify(W126-L)});
