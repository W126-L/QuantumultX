#!name=趣听音乐馆
#!desc=屏蔽趣听音乐弹窗/首页横幅
#!author=Wuang
#!category=⚙️ ▸ 应用屏蔽
#!icon=https://raw.githubusercontent.com/W126-L/QuantumultX/refs/heads/main/qutingyunyue.png
#
            
[rewrite_local]
^https?:\/\/(api|api\.next)\.bspapp\.com\/client$ url script-response-body https://raw.githubusercontent.com/W126-L/QuantumultX/main/qutingyinyue.js

[mitm]
hostname = api.bspapp.com, api.next.bspapp.com

****************************************/


var body = $response.body.replace(/\"needVerify":\d+/g, '\"needVerify":false').replace(/\"bannerList":\[.+\]/g, '\"bannerList":[]');$done({body});
