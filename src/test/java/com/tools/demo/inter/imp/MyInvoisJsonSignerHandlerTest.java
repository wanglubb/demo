package com.tools.demo.inter.imp;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class MyInvoisJsonSignerHandlerTest {

    @Test
    public void testGetApiMethodName() {
        MyInvoisJsonSignerHandler handler = new MyInvoisJsonSignerHandler();
        assertEquals("getSigner", handler.getApiMethodName());
    }

    @Test
    public void testHandleThrowsApiExceptionWhenKeystoreMissing() throws Exception {

    }

}