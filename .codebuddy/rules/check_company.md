---
description: 
alwaysApply: true
enabled: true
updatedAt: 2026-03-25T01:49:29.069Z
---

此业务请求统一使用系统自带工具ApacheHttpRequester

#  获取验证码图片
1.请求接口：
https://etax.guangdong.chinatax.gov.cn:8443/xxbg/api/zhsffw/sxsq/yzm/generate?djxh=&_=1768890025367，通过拿到响应报文中的Response.Data.Result.imageBase64Data获取验证码图片。同时保存Response.Data.Result.id 值，用于后续验证码验证。
2.请求方式：POST
3.请求参数固定：
{"Width":100,"Height":32,"CodeCount":4,"Thickness":2,"SxzlCode":"GGCX_NSRZTCX"}

# 识别验证码
1.使用ChaoJiYing的接口进行验证码识别，获取验证码Code值。



# 验证企业状态
1.请求接口：
https://etax.guangdong.chinatax.gov.cn:8443/xxbg/api/zhsffw/ggcx/nsrztcx/queryNsrztcxList?djxh=&_=1768890024960，
2.请求方式：POST
3.请求参数：
{
    "Code": "owht",//验证码
    "Id": "Captcha_8b38fc43-05f1-4b49-9984-e5c3d6b0e8ec",//验证码id
    "Nsrmc": "",//企业名称
    "Nsrsbh": "91130402MAC7WGK780"//纳税人识别号
}

# 前端展示
1.前端提交表单，包含企业名称、纳税人识别号，不能两者都为空
2.点击提交按钮，调用enttraCheck方法，获取后端返回结果
3.根据后端返回结果，展示企业状态。返回的报文示例：
{
    "Response": {
        "Data": {
            "Result": [
                {
                    "nsrmc": "河北班泰建筑工程有限公司",
                    "nsrsbh": "911304*********780",
                    "nsrztMc": "正常",
                    "swjgmc": "国家税务总局魏县税务局"
                }
            ],
            "Success": true
        },
        "RequestId": "548f38d40719b5a7"
    }
}
4.如果返回的报文结果为空，则提示“未查询到结果”
5.如果返回的报文结果不为空，则展示结果。仅显示Result中的nsrmc、nsrsbh、nsrztMc、swjgmc字段。