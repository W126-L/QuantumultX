/***********************************
> 原作者：墨鱼
[rewrite_local]
# > 酷安_开屏广告
^https?:\/\/api.coolapk.com\/v6\/main\/init url script-response-body https://raw.githubusercontent.com/W126-L/QuantumultX/main/my-rewrite_remote/kuanshequ.js
# > 酷安_推广广告
^https?:\/\/api.coolapk.com\/v6\/dataList url script-response-body https://raw.githubusercontent.com/W126-L/QuantumultX/main/my-rewrite_remote/kuanshequ.js
# > 酷安_首页广告
^https?:\/\/api.coolapk.com\/v6\/main\/indexV8 url script-response-body https://raw.githubusercontent.com/W126-L/QuantumultX/main/my-rewrite_remote/kuanshequ.js
# > 酷安_评论广告
^https?:\/\/api.coolapk.com\/v6\/feed\/replyList url script-response-body https://raw.githubusercontent.com/W126-L/QuantumultX/main/my-rewrite_remote/kuanshequ.js
# > 酷安_商品推广
^https?:\/\/api.coolapk.com\/v6\/feed\/detail url script-response-body https://raw.githubusercontent.com/W126-L/QuantumultX/main/my-rewrite_remote/kuanshequ.js
# > 酷安_屏蔽热词
^https?:\/\/api\.coolapk\.com\/v6\/search\?.*type=hotSearch url reject-dict

[mitm] 
hostname=api.coolapk.com
***********************************/

const version = 'V1.0.10';
 
if(-1!=$request.url.indexOf("replyList")){var t=JSON.parse($response.body);t.data.length&&(t.data=t.data.filter(t=>t.id)),$done({body:JSON.stringify(t)})}else if(-1!=$request.url.indexOf("main/init")){var t=JSON.parse($response.body);t.data.length&&(t.data=t.data.filter(t=>!(945==t.entityId||6390==t.entityId))),$done({body:JSON.stringify(t)})}else if(-1!=$request.url.indexOf("indexV8")){var t=JSON.parse($response.body);t.data=t.data.filter(t=>!("sponsorCard"==t.entityTemplate||8639==t.entityId||29349==t.entityId||33006==t.entityId||32557==t.entityId||-1!=t.title.indexOf("值得买")||-1!=t.title.indexOf("红包"))),$done({body:JSON.stringify(t)})}else if(-1!=$request.url.indexOf("dataList")){var t=JSON.parse($response.body);t.data=t.data.filter(t=>!("sponsorCard"==t.entityTemplate||-1!=t.title.indexOf("精选配件"))),$done({body:JSON.stringify(t)})}else if(-1!=$request.url.indexOf("detail")){var t=JSON.parse($response.body);t.data?.hotReplyRows?.length&&(t.data.hotReplyRows=t.data.hotReplyRows.filter(t=>t.id)),t.data?.topReplyRows?.length&&(t.data.topReplyRows=t.data.topReplyRows.filter(t=>t.id)),t.data?.include_goods_ids&&(t.data.include_goods_ids=[]),t.data?.include_goods&&(t.data.include_goods=[]),t.data?.detailSponsorCard&&(t.data.detailSponsorCard=[]),$done({body:JSON.stringify(t)})}else $done($response);
