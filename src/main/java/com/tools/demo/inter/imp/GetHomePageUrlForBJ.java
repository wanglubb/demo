package com.tools.demo.inter.imp;

import java.util.Map;

import com.tools.demo.exceptionHandlers.ApiException;
import com.tools.demo.inter.ApiHandler;
import com.tools.demo.vo.ApiResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tools.demo.utils.httpUtils.MyHttpRequest;
import com.tools.demo.utils.httpUtils.MyHttpResponse;
import com.tools.demo.utils.httpUtils.HttpRequester;
import com.tools.demo.utils.httpUtils.apache.ApacheHttpRequester;
import com.tools.demo.utils.ChaoJiYing;
import com.tools.demo.utils.RSAEncrypt;
import com.tools.demo.utils.RedisUtil;
import com.tools.demo.vo.constant.BeiJingTax;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;

@Service
public class GetHomePageUrlForBJ implements ApiHandler {

    // 日志记录器
    private static final Logger logger = LoggerFactory.getLogger(GetHomePageUrlForBJ.class);

    @Autowired
    private RedisUtil redisUtil;

    @Override
    public String getApiMethodName() {
        return "homePageUrl";
    }

    @Override
    public ApiResponse handle(Map<String, Object> params) throws ApiException {
        try {
            // Step 1: Get CAPTCHA
            HttpRequester httpRequester = new ApacheHttpRequester();
            MyHttpResponse captchaResponse = httpRequester
                    .execute(new MyHttpRequest("GET", BeiJingTax.CAPTCHA_URL, null, null));
            String captchaCookie = captchaResponse.getCookie("zhengtoon_verify_captcha");
            if (StrUtil.isBlank(captchaCookie)) {
                throw new ApiException(9999, "Failed to retrieve CAPTCHA cookie");
            }
            String base64 = Base64.getEncoder().encodeToString(captchaResponse.getBody());
            if (StrUtil.isBlank(base64)) {
                throw new ApiException(1001, "验证码没有获取到");
            }

            // Step 2: Decode CAPTCHA using ChaoJiYing
            String captcha = ChaoJiYing.PostPic_base64(base64, "4004");
            if (StrUtil.isBlank(captcha)) {
                throw new ApiException(9999, "Failed to decode CAPTCHA");
            }
            logger.info("验证码：" + captcha);
            logger.info("zhengtoon_verify_captcha：" + captchaCookie);

            // Step 3: Get USERLOGIN_URL
            MyHttpResponse loginResponse = httpRequester
                    .execute(new MyHttpRequest("GET", BeiJingTax.USERLOGIN_URL, null, null));
            String innerAuthCookie = loginResponse.getCookie("zhengtoon_inner_auth");
            if (StrUtil.isBlank(innerAuthCookie)) {
                throw new ApiException(9999, "Failed to retrieve inner auth cookie");
            }

            // Step 4: Get PUBKEY_URL
            // 判断redis中是否有PUBKEY，如果有，则直接使用，如果没有，则获取并保存到redis中
            Object pubKeyStr = redisUtil.get("pubKey");
            String pubKey = null;
            if (pubKeyStr == null) {
                logger.info("PUBKEY not found in Redis, retrieving...");
                HashMap<String, String> pubKeyHeaders = new HashMap<>();
                pubKeyHeaders.put("Cookie", "zhengtoon_inner_auth=" + innerAuthCookie);
                MyHttpResponse pubKeyResponse = httpRequester
                        .execute(new MyHttpRequest("GET", BeiJingTax.PUBKEY_URL, pubKeyHeaders, null));
                pubKey = JSONUtil.parseObj(pubKeyResponse.getBody()).getByPath("data.pubKey", String.class);
                if (StrUtil.isBlank(pubKey)) {
                    throw new ApiException(9999, "Failed to retrieve public key");
                }
                // Save PUBKEY to Redis , with a 5-hour expiration time
                redisUtil.set("pubKey", pubKey, 5 * 60 * 60);
            } else {
                logger.info("PUBKEY found in Redis, using...");
                pubKey = pubKeyStr.toString();
            }

            // Step 5: Login by password
            String password = params.get("password") != null ? params.get("password").toString() : null;
            String username = params.get("username") != null ? params.get("username").toString() : null;
            JSONObject requestJsonObject = JSONUtil.createObj().set("userIdentity", username).set("resetFlag", false)
                    .set("encryptedPwd", RSAEncrypt.md5Hex(password));
            if (StrUtil.isBlank(password)) {
                throw new ApiException(9999, "密码不能为空");
            }
            // RSA加密，由于pubKey缓存5小时，所以不需要每次加密，同样进行缓存，缓存时间为pubKey的剩余时间
            Object encryptDataVal = redisUtil.get("encryptData");
            String encryptData = null;
            if (encryptDataVal == null) {
                logger.info("encryptData not found in Redis, retrieving...");
                encryptData = RSAEncrypt.rsaEncryptUnicodeLongExactJS(pubKey, requestJsonObject.toString());
                redisUtil.set("encryptData", encryptData, redisUtil.getExpire("pubKey"));
            } else {
                logger.info("encryptData found in Redis, using...");
                encryptData = encryptDataVal.toString();
            }
            HashMap<String, String> loginHeaders = new HashMap<>();
            loginHeaders.put("Cookie",
                    "zhengtoon_inner_auth=" + innerAuthCookie + "; zhengtoon_verify_captcha=" + captchaCookie);
            loginHeaders.put("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            // 对请求体进行URL编码组装
            String form = "encryptData=" + URLEncoder.encode(encryptData, StandardCharsets.UTF_8.name())
                    + "&captcha=" + URLEncoder.encode(captcha, StandardCharsets.UTF_8.name());
            byte[] loginbody = form.getBytes(StandardCharsets.UTF_8);

            MyHttpResponse loginByPwdResponse = httpRequester.execute(new MyHttpRequest("POST",
                    BeiJingTax.LOGINBYPWD_URL, loginHeaders, loginbody));

            logger.info("登录结果：" + loginByPwdResponse.getContentBodyString());
            String ssoTicket = loginByPwdResponse.getCookie("zhengtoon_sso_ticket");
            if (StrUtil.isBlank(ssoTicket)) {
                throw new ApiException(9999, "找不到zhengtoon_sso_ticket");
            }

            // Step 6: Get Redirect URL
            HashMap<String, String> redirectHeaders = new HashMap<>();
            redirectHeaders.put("Cookie",
                    "zhengtoon_inner_auth=" + innerAuthCookie + "; zhengtoon_sso_ticket=" + ssoTicket);
            MyHttpResponse redirectResponse = httpRequester
                    .execute(new MyHttpRequest("GET", BeiJingTax.GETREDICRCT_URL, redirectHeaders, null));
            String homePageUrl = JSONUtil.parseObj(redirectResponse.getBody()).getByPath("data.homePageUrl",
                    String.class);
            if (StrUtil.isBlank(homePageUrl)) {
                throw new ApiException(9999, "请求跳转链接失败");
            }

            // Return the result
            HashMap<String, String> result = new HashMap<>();
            result.put("homePageUrl", homePageUrl);

            // Step 7:Get homePageUrl
            HashMap<String, String> sessionHeaders = new HashMap<>();
            sessionHeaders.put("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36");
            MyHttpResponse sessiResponse = httpRequester
                    .execute(new MyHttpRequest("GET", homePageUrl, sessionHeaders, null));
            int code = sessiResponse.getStatusCode();
            logger.info("响应码：" + code);
            if (403 == code) {
                result.put("SESSIONID", "服务器所在IP被封禁，无法获取SESSION");
            } else {// 如果SESSIONID不存在，则保存到redis中
                result.put("SESSIONID", sessiResponse.getCookie("SESSIONID"));
                redisUtil.set("SESSIONID", sessiResponse.getCookie("SESSIONID"), 60 * 60 * 1);// 5小时
            }

            return ApiResponse.success(JSONUtil.toJsonStr(result));
        } catch (ApiException e) {
            throw e; // Re-throw custom exceptions
        } catch (Exception e) {
            logger.error("获取连接异常：" + e);
            throw new ApiException(9999, "Failed to get home page URL" + e);
        }
    }
}
