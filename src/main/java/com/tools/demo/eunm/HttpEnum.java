package com.tools.demo.eunm;

public enum HttpEnum {

    GET("GET"),
    POST("POST"),
    PUT("PUT"),
    DELETE("DELETE");

    private String value;

    HttpEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

}
