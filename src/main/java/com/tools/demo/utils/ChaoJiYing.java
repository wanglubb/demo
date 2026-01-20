package com.tools.demo.utils;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;

import com.tools.demo.eunm.HttpEnum;
import com.tools.demo.exceptionHandlers.ApiException;
import com.tools.demo.utils.httpUtils.HttpRequester;
import com.tools.demo.utils.httpUtils.MyHttpClientFactory;
import com.tools.demo.utils.httpUtils.MyHttpRequest;
import com.tools.demo.utils.httpUtils.MyHttpResponse;
import com.tools.demo.vo.constant.HttpConstants;

import cn.hutool.core.map.MapUtil;
import cn.hutool.http.Header;
import cn.hutool.json.JSONUtil;

public class ChaoJiYing {

    private static final HttpRequester httpRequester = MyHttpClientFactory
            .get(HttpConstants.CONTENT_TYPE_APACHE_STRING);

    public static String PostPic_base64(String file_base64, String pic_type) throws ApiException {

        try {
            file_base64 = URLEncoder.encode(file_base64, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            throw new ApiException(9999, e.getMessage());
        }
        String postUrl = "http://upload.chaojiying.net/Upload/Processing.php";
        String s = "user=gongjin2023&pass=gongjin2023&softid=953987&codetype="+pic_type +"&len_min=4&file_base64=" + file_base64;
        HashMap<String, String> requestHeaders = MapUtil.of(Header.CONTENT_TYPE.getValue(),
                "application/x-www-form-urlencoded");
        MyHttpResponse execute = null;

        try {

            MyHttpRequest httpRequest = new MyHttpRequest(HttpEnum.POST.getValue(),
                    postUrl, requestHeaders,
                    s.getBytes());
            execute = httpRequester.execute(httpRequest);
        } catch (Exception e) {
            e.printStackTrace();
        }
        String pic_str = JSONUtil.parseObj(execute.getContentBodyString()).getStr("pic_str");
        return pic_str;
    }

}
