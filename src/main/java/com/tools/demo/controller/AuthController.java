package com.tools.demo.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tools.demo.vo.ApiResponse;

import jakarta.servlet.http.HttpSession;

/**
 * 认证控制器
 * 处理用户登录、登出等认证相关功能
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    // 简单的用户名密码验证（实际项目中应该从数据库获取）
    private static final String DEFAULT_USERNAME = "demo";
    private static final String DEFAULT_PASSWORD = "demo123";

    /**
     * 用户登录接口
     * 
     * @param loginRequest 登录请求参数，包含username和password
     * @param session      HTTP会话对象
     * @return ApiResponse 登录结果
     */
    @PostMapping("/login")
    public ApiResponse login(@RequestBody Map<String, String> loginRequest, HttpSession session) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        logger.info("用户尝试登录: {}", username);

        // 验证用户名和密码
        if (DEFAULT_USERNAME.equals(username) && DEFAULT_PASSWORD.equals(password)) {
            // 登录成功，将用户信息存储到session中
            session.setAttribute("user", username);
            session.setAttribute("loginTime", System.currentTimeMillis());

            logger.info("用户登录成功: {}", username);
            return ApiResponse.success("登录成功");
        } else {
            logger.warn("用户登录失败: {} - 用户名或密码错误", username);
            return ApiResponse.error(401, "用户名或密码错误");
        }
    }

    /**
     * 用户登出接口
     * 
     * @param session HTTP会话对象
     * @return ApiResponse 登出结果
     */
    @PostMapping("/logout")
    public ApiResponse logout(HttpSession session) {
        String username = (String) session.getAttribute("user");

        if (username != null) {
            logger.info("用户登出: {}", username);
            session.invalidate(); // 清除session
            return ApiResponse.success("登出成功");
        } else {
            return ApiResponse.error(400, "用户未登录");
        }
    }

    /**
     * 检查登录状态接口
     * 
     * @param session HTTP会话对象
     * @return ApiResponse 登录状态信息
     */
    @GetMapping("/status")
    public ApiResponse checkStatus(HttpSession session) {
        String username = (String) session.getAttribute("user");
        Long loginTime = (Long) session.getAttribute("loginTime");

        if (username != null) {
            return ApiResponse.success(Map.of(
                    "isLoggedIn", true,
                    "username", username,
                    "loginTime", loginTime));
        } else {
            return ApiResponse.success(Map.of("isLoggedIn", false));
        }
    }

}