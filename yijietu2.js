/***********************************
> 应用名称：易截图2
> 软件版本：1.2.2
> 下载地址：https://apps.apple.com/cn/app/id1633186528
> 解锁说明：去除水印，解锁高级功能

[rewrite_local]
  
# > 易截图2☆去除水印（2023-08-02）
^https?:\/\/.*jietu.*com/apiv\d/user url script-response-body https://raw.githubusercontent.com/W126-L/QuantumultX/main/yijietu2.js


[mitm] 

hostname=*jietu*

***********************************/





var body = $response.body.replace(/group_id":"\d/g, 'group_id":"3')
$done({ body })
