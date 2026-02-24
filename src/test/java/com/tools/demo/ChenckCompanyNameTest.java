package com.tools.demo;

import java.util.HashMap;
import java.util.Map;

import com.tools.demo.inter.imp.CheckCompanyNameForBJ;
import com.tools.demo.vo.ApiResponse;

import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringBootTest(classes = DemoApplication.class)
@SpringJUnitConfig
public class ChenckCompanyNameTest {

    private static final Logger logger = LoggerFactory.getLogger(ChenckCompanyNameTest.class);

    @Autowired
    private CheckCompanyNameForBJ checkCompanyName;

    @Test
    public void testCheckCompanyName() throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("entname", "北京市东城区威武信息咨询有限公司");
        params.put("enttra", "威武");
        params.put("traind", "信息咨询");
        params.put("dmvalue", "7243");
        ApiResponse handle = checkCompanyName.handle(params);
        System.out.println(handle.getCode() + ":" + handle.getMessage());

    }

}
