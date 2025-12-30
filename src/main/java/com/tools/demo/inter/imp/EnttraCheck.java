package com.tools.demo.inter.imp;

import java.util.Map;

import com.tools.demo.inter.ApiHandler;
import com.tools.demo.vo.ApiResponse;

public class EnttraCheck implements ApiHandler {

    @Override
    public String getApiMethodName() {
        return "enttraCheck";
    }

    @Override
    public ApiResponse handle(Map<String, Object> params) throws Exception {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'handle'");
    }

}
