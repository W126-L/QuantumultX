/*
 * @Author: bgcode
 * @Date: 2024-08-05 12:51:41
 * @LastEditors: bgcode
 * @LastEditTime: 2024-08-23 18:29:57
 * @Description: 
 * @FilePath: /QX/rewrite_remote/xbs/render.js
 */
const url = "https://cdn.jsdelivr.net/gh/bgvioletsky/QX@0.1.16/rewrite_remote/xbs/render.html";
const myRequest = {
    url: url
};
/*
* @Author：BGcode
* @Date：2024-08-05 12：51：41
* @LastEditors：bgcode
* @LastEditTime时间：2024-08-23 18：29：57
* @Description：
* @FilePath：/QX/rewrite_remote/xbs/render.js
 */
const url = “https://cdn.jsdelivr.net/gh/bgvioletsky/QX@0.1.16/rewrite_remote/xbs/render.html”;
const myRequest = {
网址： url
};

$task.fetch(myRequest).then(response => {
    $done({bodyBytes: response.bodyBytes});
}, reason => {
    $done();
});
$task.fetch（myRequest）.then（响应 => {
$done（{bodyBytes： response.bodyBytes}）;
}， 原因 => {
$done（）;
});
