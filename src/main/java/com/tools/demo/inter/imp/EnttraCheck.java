package com.tools.demo.inter.imp;

import java.util.Map;
import java.util.HashMap;

import com.tools.demo.inter.ApiHandler;
import com.tools.demo.vo.ApiResponse;
import com.tools.demo.utils.ChaoJiYing;
import com.tools.demo.utils.httpUtils.HttpRequester;
import com.tools.demo.utils.httpUtils.MyHttpClientFactory;
import com.tools.demo.utils.httpUtils.MyHttpRequest;
import com.tools.demo.utils.httpUtils.MyHttpResponse;
import com.tools.demo.vo.constant.HttpConstants;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.tools.demo.eunm.HttpEnum;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;

@Service
public class EnttraCheck implements ApiHandler {
    private static final Logger logger = LoggerFactory.getLogger(EnttraCheck.class);

    @Override
    public String getApiMethodName() {
        return "enttraCheck";
    }

    @Override
    public ApiResponse handle(Map<String, Object> params) throws Exception {
        // 获取企业名称和税号
        String entName = (String) params.get("entName");
        String taxNumber = (String) params.get("taxNumber");

        if (entName == null && taxNumber == null) {
            return ApiResponse.error(400, "企业名称和税号不能同时为空");
        }

        // 1. 获取验证码图片
        HttpRequester httpRequester = MyHttpClientFactory.get(HttpConstants.CONTENT_TYPE_APACHE_STRING);
        String captchaUrl = "https://etax.guangdong.chinatax.gov.cn:8443/xxbg/api/zhsffw/sxsq/yzm/generate?djxh=&_="
                + System.currentTimeMillis();

        // 请求参数
        String captchaParams = "{\"Width\":100,\"Height\":32,\"CodeCount\":4,\"Thickness\":2,\"SxzlCode\":\"GGCX_NSRZTCX\"}";

        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");

        MyHttpRequest captchaRequest = new MyHttpRequest(HttpEnum.POST.getValue(), captchaUrl, headers,
                captchaParams.getBytes());
        MyHttpResponse captchaResponse = httpRequester.execute(captchaRequest);

        String captchaResponseBody = captchaResponse.getContentBodyString();
        JSONObject captchaResult = JSONUtil.parseObj(captchaResponseBody);

        // 提取验证码ID和图片Base64
        String imgBase64Data = captchaResult.getJSONObject("Response").getJSONObject("Data").getJSONObject("Result")
                .getStr("imageBase64Data");
        String captchaId = captchaResult.getJSONObject("Response").getJSONObject("Data").getJSONObject("Result")
                .getStr("id");
        logger.debug("验证码ID: {}", captchaId);
        if (imgBase64Data == null || captchaId == null) {
            return ApiResponse.error(500, "获取验证码失败");
        }
        // 切割获取的Base64数据,去掉前缀
        String[] imgBase64DataArray = imgBase64Data.split(",");
        imgBase64Data = imgBase64DataArray[1];

        // 2. 使用ChaoJiYing识别验证码
        String verifyCode = ChaoJiYing.PostPic_base64(imgBase64Data, "1902");
        if (verifyCode == null || verifyCode.isEmpty()) {
            return ApiResponse.error(500, "验证码识别失败");
        }
        logger.info("验证码: {}", verifyCode);
        // 3. 验证企业状态
        String checkUrl = "https://etax.guangdong.chinatax.gov.cn:8443/xxbg/api/zhsffw/ggcx/nsrztcx/queryNsrztcxList?djxh=&_="
                + System.currentTimeMillis();
        String checkParams = String.format("{\"Code\":\"%s\",\"Id\":\"%s\",\"Nsrmc\":\"%s\",\"Nsrsbh\":\"%s\"}",
                verifyCode, captchaId, entName, taxNumber);

        MyHttpRequest checkRequest = new MyHttpRequest(HttpEnum.POST.getValue(), checkUrl, headers,
                checkParams.getBytes());
        MyHttpResponse checkResponse = httpRequester.execute(checkRequest);

        String checkResponseBody = checkResponse.getContentBodyString();
        return ApiResponse.success(JSONUtil.parse(checkResponseBody));
    }

}