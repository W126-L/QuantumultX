#!name=易截图2
#!desc=去除水印，解锁高级功能
#!author=留存@wuang
#!category=⚙ ▸ 应用解锁、增强
#!icon=https://raw.githubusercontent.com/W126-L/QuantumultX/refs/heads/main/yijietu.png

[rewrite_local]
^https?:\/\/.*jietu.*com/apiv\d/user url script-response-body https://github.com/W126-L/Tool/raw/refs/heads/master/Scripts/yijietu2.js


[mitm] 

hostname=*jietu*







var body = $response.body.replace(/group_id":"\d/g, 'group_id":"3')
$done({ body })
