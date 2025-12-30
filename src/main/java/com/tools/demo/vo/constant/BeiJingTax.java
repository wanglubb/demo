package com.tools.demo.vo.constant;

public class BeiJingTax {

    public static final String CAPTCHA_URL = "https://bjt.beijing.gov.cn/renzheng/common/generateCaptcha";// 获取验证码
    public static final String USERLOGIN_URL = "https://bjt.beijing.gov.cn/renzheng/open/login/goUserLogin?client_id=2150&redirect_uri=https://ect.scjgj.beijing.gov.cn/ect/apply/baic/user/redirect.do&response_type=code&scope=user_info&state=";// 登录页面
    public static final String PUBKEY_URL = "https://bjt.beijing.gov.cn/renzheng/inner/client/getClientInfo";// 获取公钥
    public static final String LOGINBYPWD_URL = "https://bjt.beijing.gov.cn/renzheng/inner/login/doUserLoginByPwd";// 登录
    public static final String GETREDICRCT_URL = "https://bjt.beijing.gov.cn/renzheng/inner/info/getRedirectUri";// 获取重定向地址

}
