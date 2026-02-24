package com.tools.demo.inter.imp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tools.demo.inter.ApiHandler;
import com.tools.demo.utils.RedisUtil;
import com.tools.demo.utils.httpUtils.MyHttpRequest;
import com.tools.demo.utils.httpUtils.MyHttpResponse;
import com.tools.demo.utils.httpUtils.apache.ApacheHttpRequester;
import com.tools.demo.vo.ApiResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;

import java.util.HashMap;
import java.util.Map;

@Service
public class CheckCompanyNameForBJ implements ApiHandler {

    private static final Logger logger = LoggerFactory.getLogger(CheckCompanyNameForBJ.class);

    @Autowired
    private RedisUtil redisUtil;

    private static final String CHECK_NAME_URL = "https://ect.scjgj.beijing.gov.cn/ect/apply/baic/name/checkNmInfo.do";
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getApiMethodName() {
        return "checkCompanyNameForBJ";
    }

    @Override
    public ApiResponse handle(Map<String, Object> params) throws Exception {

        try {

            // 获取缓存中的SESSION_ID
            String sessionId = (String) redisUtil.get("SESSIONID");
            if (sessionId == null) {
                return ApiResponse.error(1001, "未登录，请先通过快速模块登录北京工商网");
            }
            // 获取参数并进行验证
            String entname = (String) params.get("entname"); // 企业名称
            String enttra = (String) params.get("enttra"); // 企业简称
            String traind = (String) params.get("traind"); // 行业特点
            String dmvalue = (String) params.get("dmvalue"); // 行业代码

            // 验证参数是否存在
            if (entname == null || enttra == null || traind == null || dmvalue == null) {
                return ApiResponse.error(4000, "缺少必要参数");
            }

            // 验证参数是否为空
            if (entname.trim().isEmpty() || enttra.trim().isEmpty() ||
                    traind.trim().isEmpty() || dmvalue.trim().isEmpty()) {
                return ApiResponse.error(4000, "参数不能为空");
            }

            // 使用ObjectMapper构建JSON
            Map<String, Object> nmInfo = new HashMap<>();
            nmInfo.put("entname", entname.trim());
            nmInfo.put("enttra", enttra.trim());
            nmInfo.put("traind", enttra.trim() + traind.trim()); // 企业简称+行业特点
            nmInfo.put("industryco", dmvalue.trim());

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("nmInfo", nmInfo);

            Map<String, Object> dataMap = new HashMap<>();
            dataMap.put("data", requestBody);

            String data = objectMapper.writeValueAsString(dataMap);
            // 发送请求
            ApacheHttpRequester requester = new ApacheHttpRequester();
            byte[] requestBodyBytes = data.getBytes("UTF-8");
            // 设置请求头
            Map<String, String> headers = new java.util.HashMap<>();
            headers.put("Content-Type", "multipart/form-data; boundary=----WebKitFormBoundaryIjacix1baDIi2ZLn");
            headers.put("USER-AGENT",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36");
            headers.put("Accept", "application/json, text/plain, */*");
            headers.put("Cookie", "SESSIONID=" + sessionId);
            // 构建请求对象
            MyHttpRequest request = new MyHttpRequest("POST", CHECK_NAME_URL, headers, requestBodyBytes);

            MyHttpResponse response = requester.execute(request);
            String responseStr = new String(response.getBody(), "UTF-8");

            if (responseStr == null || responseStr.isEmpty()) {
                return ApiResponse.error(500, "服务器返回空响应");
            }

            // 解析响应
            JsonNode responseNode = objectMapper.readTree(responseStr);
            // 检查是否正常响应
            if (!"success".equals(responseNode.get("result").asText())) {
                logger.error(responseStr);
                return ApiResponse.error(4001, "返回结果有误");
            }

            // 获取data部分
            JsonNode dataNode = responseNode.get("data");
            if (dataNode == null) {
                return ApiResponse.error(4001, "返回结果有误");
            }

            // 获取allMsg数组
            JsonNode allMsgNode = dataNode.get("allMsg");
            if (allMsgNode == null || allMsgNode.isEmpty()) {
                logger.error(responseStr);
                return ApiResponse.error(4001, "返回结果有误");
            }

            // 遍历allMsg数组，检查每个元素的type是否有lock
            if (allMsgNode.isArray()) {
                for (JsonNode msgItem : allMsgNode) {
                    String type = msgItem.get("type").asText();
                    if ("lock".equals(type)) {
                        String msg = msgItem.get("msg").asText();
                        return ApiResponse.error(4002, "核名不通过，原因：" + msg);
                    }
                }
            }

            return ApiResponse.success("核名通过");
        } catch (Exception e) {
            // 记录错误日志
            e.printStackTrace();
            return ApiResponse.error(5001, "处理过程中发生错误: " + e.getMessage());
        }
    }

}