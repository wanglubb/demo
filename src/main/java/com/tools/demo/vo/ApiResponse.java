package com.tools.demo.vo;

public class ApiResponse {
    private int code;
    private String message;
    private Object data;

    public static ApiResponse success(Object data) {
        ApiResponse response = new ApiResponse();
        response.code = 200;
        response.message = "success";
        response.data = data;
        return response;
    }

    public static ApiResponse error(int code, String message) {
        ApiResponse response = new ApiResponse();
        response.code = code;
        response.message = message;
        return response;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public Object getData() {
        return data;
    }

}
