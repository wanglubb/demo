package com.tools.demo.utils;

import com.tools.demo.DemoApplication;

import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = DemoApplication.class)
@SpringJUnitConfig
class RedisUtilTest {

    private static final org.slf4j.Logger logger = LoggerFactory.getLogger(RedisUtilTest.class);

    @Autowired
    private RedisUtil redisUtil;

    @Test
    void testSetAndGet() {
        String key = "test_key";
        // 测试获取值
        Object getResult = redisUtil.get(key);
        logger.info("获取的值是：" + getResult.toString());
    }

    @Test
    void testSetWithExpireTime() {
        String key = "test_expire_key";
        String value = "test_expire_value";
        long time = 10; // 10秒

        boolean setResult = redisUtil.set(key, value, time);
        assertTrue(setResult, "设置带过期时间的值应该成功");

        Object getResult = redisUtil.get(key);
        assertEquals(value, getResult, "获取的值应该与设置的值相同");

        long expireTime = redisUtil.getExpire(key);
        assertTrue(expireTime > 0 && expireTime <= time, "过期时间应在合理范围内");
    }

    @Test
    void testHasKey() {
        String key = "existent_key";
        String value = "some_value";

        // 先设置一个键
        redisUtil.set(key, value);

        // 测试存在键的情况
        boolean hasKey = redisUtil.hasKey(key);
        assertTrue(hasKey, "键应该存在");

        // 测试不存在键的情况
        boolean hasNonExistentKey = redisUtil.hasKey("non_existent_key");
        assertFalse(hasNonExistentKey, "键不应该存在");
    }

    /**
     * 测试Redis键的过期功能
     * 验证键值对在设置过期时间后是否能够正确过期
     */
    @Test
    void testExpireFunctionality() {
        // 定义测试用的键名
        String key = "expire_test_key";
        // 定义测试用的值
        String value = "expire_test_value";

        // 设置值
        redisUtil.set(key, value);

        // 设置过期时间为2秒
        boolean expireResult = redisUtil.expire(key, 2);
        assertTrue(expireResult, "设置过期时间应该成功");

        // 立即检查，应该还存在
        assertTrue(redisUtil.hasKey(key), "键应该仍然存在");

        // 等待超过过期时间
        try {
            Thread.sleep(3000); // 等待3秒
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // 检查是否已经过期
        assertFalse(redisUtil.hasKey(key), "键应该已经过期");
    }

    @Test
    void testDelFunctionality() {
        String key = "delete_test_key";
        String value = "delete_test_value";

        // 设置一个键值对
        redisUtil.set(key, value);
        assertTrue(redisUtil.hasKey(key), "键应该存在");

        // 删除键
        redisUtil.del(key);

        // 验证键已被删除
        assertFalse(redisUtil.hasKey(key), "键应该已经被删除");
    }

    @Test
    void testMultipleKeysDeletion() {
        String[] keys = { "multi_del_key1", "multi_del_key2", "multi_del_key3" };
        String value = "multi_delete_value";

        // 设置多个键
        for (String key : keys) {
            redisUtil.set(key, value);
            assertTrue(redisUtil.hasKey(key), "键 " + key + " 应该存在");
        }

        // 删除多个键
        redisUtil.del(keys);

        // 验证所有键都被删除
        for (String key : keys) {
            assertFalse(redisUtil.hasKey(key), "键 " + key + " 应该已经被删除");
        }
    }

    @Test
    void testIncrAndDecr() {
        String key = "counter_key";
        long initialValue = 0L;

        // 设置初始值
        redisUtil.set(key, initialValue);

        // 测试递增
        long incrResult = redisUtil.incr(key, 5);
        assertEquals(5L, incrResult, "递增后的值应该是5");

        // 再次递增
        long secondIncrResult = redisUtil.incr(key, 3);
        assertEquals(8L, secondIncrResult, "再次递增后的值应该是8");

        // 测试递减
        long decrResult = redisUtil.decr(key, 3);
        assertEquals(5L, decrResult, "递减后的值应该是5");
    }

    @Test
    void testIncrWithInvalidDelta() {
        String key = "invalid_incr_key";
        redisUtil.set(key, 0L);

        // 测试负数增量（应该抛出异常）
        assertThrows(RuntimeException.class, () -> {
            redisUtil.incr(key, -5);
        }, "递增函数应该拒绝负数增量");
    }

    @Test
    void testDecrWithInvalidDelta() {
        String key = "invalid_decr_key";
        redisUtil.set(key, 10L);

        // 测试负数增量（应该抛出异常）
        assertThrows(RuntimeException.class, () -> {
            redisUtil.decr(key, -5);
        }, "递减函数应该拒绝负数增量");
    }

    @Test
    void testNullKeyHandling() {
        // 测试空键的获取
        Object result = redisUtil.get(null);
        assertNull(result, "空键的获取结果应该为null");
    }

    @Test
    void testLargeValueStorage() {
        String key = "large_value_key";
        StringBuilder largeValue = new StringBuilder();
        for (int i = 0; i < 1000; i++) {
            largeValue.append("This is a test string number ").append(i).append(" ");
        }
        String value = largeValue.toString();

        // 存储大值
        boolean setResult = redisUtil.set(key, value);
        assertTrue(setResult, "存储大值应该成功");

        // 获取大值
        Object getResult = redisUtil.get(key);
        assertNotNull(getResult, "获取的大值不应为空");
        assertEquals(value, getResult, "获取的大值应该与存储的值相同");
    }
}