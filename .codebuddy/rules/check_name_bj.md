---
description: 
alwaysApply: true
enabled: true
updatedAt: 2026-03-25T01:49:30.067Z
---

目标
 - 实现企业核名的后端逻辑和前端交互
工具
 - 此业务后端请求统一使用系统自带工具ApacheHttpRequester
步骤
1.企业核名接口，按以下步骤实现CheckCompanyNameForBJ的handle方法
    1.1.接口： https://ect.scjgj.beijing.gov.cn/ect/apply/baic/name/checkNmInfo.do
    1.2.请求方式：POST
    1.3.请求头：
    1.3.请求报文实例：
            {
    "nmInfo": {
        "entname": "北京市东城区威武信息咨询有限公司",//企业名称，来自前端entname
		"enttra": "威武",//企业简称，来自前端enttra
		"traind": "威武信息咨询",//企业简称+行业特点，
        "industryco": "7243"//行业代码，来自前端dmvalue
    }
}
    1.4.返回报文示例：参考bj_check_res.json。

前端：
 - 样式:点击立即使用，弹出表单，包含四个输入框：分别输入地区，简称，行业特点，行业代码，一个"检查"按钮
 - 逻辑：点击检查按钮后，将地区存入变量areaname，将简称存入变量enttra，行业特点存入变量traind，将行业代码存入变量dmvalue，点击"检查"按钮后，调用企业核名接口，获取企业核名结果，
 - 结果：
    1. 异常处理：正常响应报文应该是bj_check_res.json，如格式不对，直接显示"返回结果有误"
    2. 正常处理：正常响应报文应该是bj_check_res.json，data.allMsg中包含msgList数组，遍历所有的msgList，检查是否有type = lock，如果有，则核名不通过，显示"核名不通过，原因：" + data.allMsg.msgList[0].msg；否则显示"核名通过"