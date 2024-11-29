/***********************************************
> 原作者：墨鱼
> 使用说明：请在本地添加分流 host, ad.12306.cn, direct
[rewrite_local]
^https?:\/\/ad\.12306\.cn\/ad\/ser\/getAdList url script-analyze-echo-response https://raw.githubusercontent.com/W126-L/Tool/master/Scripts/12306.js

[mitm]
hostname = ad.12306.cn
***********************************************/
