package com.tools.demo;

import java.util.HashMap;

import com.tools.demo.eunm.HttpEnum;
import com.tools.demo.exceptionHandlers.ApiException;
import com.tools.demo.inter.imp.EnttraCheck;
import com.tools.demo.inter.imp.GetHomePageUrlForBJ;
import com.tools.demo.utils.httpUtils.MyHttpClientFactory;
import com.tools.demo.utils.httpUtils.MyHttpRequest;
import com.tools.demo.utils.httpUtils.HttpRequester;
import com.tools.demo.utils.httpUtils.MyHttpResponse;
import com.tools.demo.vo.ApiResponse;
import com.tools.demo.vo.constant.BeiJingTax;
import com.tools.demo.vo.constant.HttpConstants;

import org.junit.jupiter.api.Test;

import cn.hutool.core.map.MapUtil;
import cn.hutool.http.Header;

public class HttpUtilTest {

    private static final String TEST_URL_STRING = "https://ect.scjgj.beijing.gov.cn/ect/apply/baic/user/redirect.do?code=24bfe5ca-f3a9-3b10-8b50-f2d3f7b5cb22&state=null";
    private static final String big_Dic_Bultems_URL = "https://air.scjgj.gz.gov.cn/aionweb/register/bultem/getBigDicBultems";
    private static final String GENERATECAPTCHA_STRING = "https://bjt.beijing.gov.cn/renzheng/common/generateCaptcha";
    private static final String COOKIE_STRING = "AIONWEBUSID=NTQ5ZTIyNDEtM2QwYy00ZmRlLWFjMDMtODI5MjE0ZWRlMmM0";
    private static final String ACCEPT_STRING = "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8";
    private static final HttpRequester httpRequester = MyHttpClientFactory
            .get(HttpConstants.CONTENT_TYPE_APACHE_STRING);

    @Test
    public void testgetBigDicBultems() {
        try {

            HashMap<String, String> requestHeaders = MapUtil.of(Header.USER_AGENT.getValue(),
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36");
            /*
             * JSONObject requestJsonObject = JSONUtil.createObj();
             * String body = requestJsonObject.set("type", "001").set("parentcode",
             * "M01").toString();
             */

            MyHttpRequest httpRequest = new MyHttpRequest(HttpEnum.GET.getValue(), TEST_URL_STRING,
                    requestHeaders, null);
            MyHttpResponse reHttpResponse = httpRequester.execute(httpRequest);
            reHttpResponse.getHeaders().forEach((key, value) -> System.out.println(key + " : " + value));
            int code = reHttpResponse.getStatusCode();
            if (403 == code) {
                System.out.println("IP已被封禁，需要更换IP");
            } else {
                System.out.println(reHttpResponse.getCookie("SESSIONID"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println(e.getMessage());
        }

    }

    @Test
    public void testgetHomePageUrlForBJ() {

        // 构造入参
        HashMap<String, Object> userinfo = new HashMap<>();
        userinfo.put("password", "Aa13536022721");
        userinfo.put("username", "13660102924");

        // 调用
        GetHomePageUrlForBJ getHomePageUrlForBJ = new GetHomePageUrlForBJ();
        try {
            ApiResponse handle = getHomePageUrlForBJ.handle(userinfo);
            System.out.println(handle.getData());
        } catch (ApiException e) {
            System.out.println(e.getMessage());
        }

    }

    @Test
    public void testRedirectBehavior() {
        try {
            // 设置请求头
            HashMap<String, String> requestHeaders = MapUtil.of(
                    Header.USER_AGENT.getValue(),
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36");

            // 构造请求
            MyHttpRequest httpRequest = new MyHttpRequest(HttpEnum.GET.getValue(), BeiJingTax.USERLOGIN_URL,
                    requestHeaders, null);

            // 执行请求
            MyHttpResponse reHttpResponse = httpRequester.execute(httpRequest);

            // 打印响应状态码和头部信息
            System.out.println("状态码: " + reHttpResponse.getStatusCode());
            reHttpResponse.getHeaders().forEach((key, value) -> System.out.println(key + " : " + value));

            // 检查是否发生重定向
            if (reHttpResponse.getStatusCode() == 302) {
                System.out.println("发生重定向，目标地址: " + reHttpResponse.getHeaders().get("Location"));
            } else {
                System.out.println("未发生重定向");
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("请求失败: " + e.getMessage());
        }
    }

    @Test
    public void testGenerateCaptcha() {
        HashMap<String, Object> userinfo = new HashMap<>();

        userinfo.put("taxNumber", "91130402MAC7WGK780");

        try {
            EnttraCheck enttraCheck = new EnttraCheck();
            ApiResponse handle = enttraCheck.handle(userinfo);
            System.out.println("响应状态码：" + handle.getCode() + " 响应数据：" + handle.getData());
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("请求失败: " + e.getMessage());
        }
    }
}
