var configUrl = location.host.split('.')[0] === 'www'
    ? '//www.test.com:8082/'
    : location.host.split('.')[0] === 't100renzheng-portal'
    ? '//t100renzheng.zhengtoon.com/'
    : '//bjt.beijing.gov.cn/renzheng/';
var configWebUrl = location.host.split('.')[0] === 'www'
    ? '//www.test.com/'
    : location.host.split('.')[0] === 't100renzheng-portal'
    ? '//t100renzheng-portal.zhengtoon.com/'
    : '//portal.bjt.beijing.gov.cn/';
var captchaBaseUrl = location.host.split('.')[0] === 'www' ? 'http://www.test.com:8082' : 'https://bjt.beijing.gov.cn/renzheng';
var utils = {
    login_scan_type: 1,  // 1: 开启扫码登录 0: 默认账号密码登录
    requestTimeOut: 15000,
    commonUrl: configUrl,
    commonWebUrl: configWebUrl,
    // 神策埋点服务地址
    // 测试环境 : "//da.systoon.com/sa?project=default"
    // 生产环境 : "//da.systoon.com/sa?project=production",
    sensors_server_url: "//da.systoon.com/sa?project=production" ,
    //正式上线请修改appId为线上应用的appid  t100 =  ; t200 =  ;
    sensors_app_id : "",
    // 短信类型:
    sms_login_type: "login_type",  //登录
    sms_register_type: "register_type",  //注册
    sms_forget_pwd_type: "forget_pwd_type",  // 忘记密码
    sms_update_type: "update_user_message_type", // 修改个人信息
    sms_bank_certification_type: "bank_certification_type",  // 银行认证
    sms_face_certification_type: "face_certification_type",  // 人脸认证
    sms_log_out_type: "log_out_type",   // 注销
    captchaBaseUrl : captchaBaseUrl,
    post: function (confObj) {
        if (typeof confObj == "undefined") {
            confObj = {};
        }
        var defConf = {
            supportCors: true,
            commonUrl: null,
            needJson: true,
            noLoading: false,
            url: "",
            data: {},
            timeout: utils.requestTimeOut,
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            async: true,
            headers: {Accept: "application/json; charset=utf-8"},
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            beforeSend: function () {
            },
            success: function () {

            },
            error: function () {
                console.log('error');

            },
            complete: function (data) {
                if(data.responseText) {
                    var res = JSON.parse(data.responseText);
                    if(res.meta.code === "5022") {
                        window.location.href = utils.commonWebUrl+"p/transfer/transfer.html";
                    }
                }
            }
        };
        var setting = $.extend(true, defConf, confObj);
        jQuery.support.cors = setting.supportCors;
        /*
        * 用来遍历指定对象所有的属性名称和值
        * obj 需要遍历的对象
        * author: Jet Mah
        */

        var SpecialCharacter = function (sourceData) {
            var result = sourceData;
            for (var key in sourceData) {
                if (typeof sourceData[key] === 'object' || typeof sourceData[key] === 'array') {
                    SpecialCharacter(sourceData[key])
                } else if (typeof sourceData[key] === 'string') {
                    result[key] = sourceData[key].replace(/\"/g, "＂").replace(/\\/g, '\\');
                }
            }
            return result;
        };
        var _url = (setting.url).indexOf("http://") > -1 ? setting.url : (setting.commonUrl ? setting.commonUrl : utils.commonUrl) + setting.url;
        $.ajax({
            url: _url,
            data: setting.needJson ? JSON.stringify(SpecialCharacter(setting.data)) : setting.data,
            type: "post",
            dataType: "JSON",
            contentType: setting.contentType,
            async: setting.async,
            timeout: setting.timeout,
            headers: setting.headers,
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            beforeSend: setting.beforeSend,
            success: setting.success,
            error: setting.error,
            complete: setting.complete
        });
    },
    /**
     * get请求方法。参数类型{url：‘’，data：‘’}
     * @param confObj
     * @returns {boolean}
     */
    get: function (confObj) {
        if (typeof confObj == "undefined") {
            confObj = {};
        }
        var defConf = {
            supportCors: true,
            commonUrl: null,
            url: "",
            data: {},
            timeout: utils.requestTimeOut,
            async: true,
            crossDomain: true,
            cache: false,
            headers: {Accept: "application/json; charset=utf-8"},
            success: function (data) {

            },
            error: function (xml, XMLHttpRequest, errMsg, e) {
            },
            complete: function () {
                console.log('complete');
            }
        };
        var setting = $.extend(true, defConf, confObj);
        if (!setting.url) {
            return false;
        }
        jQuery.support.cors = setting.supportCors;
        var _url = (setting.url).indexOf("http://") > -1 ? setting.url : (setting.commonUrl ? setting.commonUrl : utils.commonUrl) + setting.url;
        $.ajax({
            url: _url,
            data: setting.data,
            type: "get",
            dataType: "JSON",
            xhrFields: {
             withCredentials: true
            },
            crossDomain: true,
            async: setting.async,
            timeout: setting.timeout,
            headers: setting.headers,
            success: setting.success,
            error: setting.success
        });
    },
    /**
     * 获得地址栏参数
     * @returns {*}
     */
    getQueryStringHr: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r === null) {
            var reg2 = /^.*?[?]/;
            var r2 = window.location.hash.replace(reg2, "")
            r = r2.match(reg);
        }
        if (r != null) {
            return decodeURIComponent((r[2]));
        }
        return null;
    },
    /**
     * toast提示
     */
    toast: function(mess){
        var str='<div class="mess" style="position:fixed;top:50%;left:50%;padding:10px 15px;transform:translate(-50%,-50%);color:#fff;background-color:rgba(0,0,0,.5);border-radius:5px;"><span></span></div>';
        $("body").append(str);
        $(".mess").fadeIn().find("span").html(mess);
        setTimeout(function(){
            $(".mess").fadeOut();
        },2000)
    },
    /**
     * 禁止输入空格
     */
    banBlankInput: function () {
        document.onkeydown = function (event) {
            var e = event || window.event;
            var k = e.keyCode || e.which;
            switch (k) {
                case 32:
                    e.returnValue = false;
                    e.preventDefault();
            }
            e.cancel = true;
        };
    },
    /**
     * 只能输入数字
     */
    onlyNumInput: function () {
        $('.number').keypress(function(e){
            var code = e.keyCode|e.which;
            if(code == 8 || code == 13 || code == 9 || code == 37 || code == 39 || code == 46){
                return true;
            }
            if((code<48 || code>57)) {
                return false;
            }
        });
    },
    /**
     * 加密
     * @param publicKey 公钥
     * @param object  需要加密的对象
     * @returns {string|*}
     */
    getEncryptedData: function (publicKey, object) {
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(publicKey);
        return encrypt.encryptUnicodeLong(JSON.stringify(object));
    },

    getEncryptedString: function (publicKey, object) {
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(publicKey);
        return encrypt.encryptUnicodeLong(object);
    },
    /**
     * 设置sessionStorage
     * @param key
     * @param value  如果传value为set  不传则为get
     */
    sessionData: function (key, value) {
        if(value) {
            value = JSON.stringify(value);
            sessionStorage.setItem(key, value)
        }else {
            var value = sessionStorage.getItem(key);
            value = value&&JSON.parse(value);
            return value;
        }
    },
    /**
     * 设置localStorage
     * @param key
     * @param value  如果传value为set  不传则为get
     */
    localData: function (key, value) {
        if(value) {
            value = JSON.stringify(value);
            localStorage.setItem(key, value)
        }else {
            var value = localStorage.getItem(key);
            value = JSON.parse(value);
            return value;
        }
    },
    trim: function(value) {
        return value.replace(/\s/g,"");
    },
    /**
     * 绑定粘贴清除空格的方法
     */
    bindPasteTrim: function(selector) {
        $(""+selector).on("paste", function(e){
            var pastedText =  utils.getPastedText(e);
            var value = utils.trim(pastedText);
            var _this = this;
            setTimeout(function(){
                $(_this).val(value)
            },0)
        })
    },
    /**
     * 获取粘贴板的内容
     */
    getPastedText: function(e) {
        var pastedText = undefined;
        if (window.clipboardData && window.clipboardData.getData) { // IE
            pastedText = window.clipboardData.getData('Text');
        } else {
            pastedText = e.originalEvent.clipboardData.getData('Text');//e.clipboardData.getData('text/plain');
        }
        return pastedText;
    },
    /**
     * 获取掩码手机号  前三后四
     * @param phoneNum
     * @returns {void|string|XML}
     */
    getMaskPhone: function(phoneNum) {
        return  phoneNum.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    },
    /**
     * 判断是否为IE
     */
    isIE: function() {
        var userAgent = navigator.userAgent;
        if(userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1) {
            return true;
        }else {
            return false;
        }
    },
    /**
     * 判断是否为EDGE
     */
    isEDGE: function() {
        var userAgent = navigator.userAgent;
        if(userAgent.indexOf("Trident/7.0") > -1) {
            return true;
        }else {
            return false;
        }
    },
    /**
     * 判断是否为Chrome
     */
    isChrome: function() {
        var userAgent = navigator.userAgent;
        if(userAgent.indexOf("Chrome") > -1 ) {
            return true;
        }else {
            return false;
        }
    },
    /**
     * 判断是否支持placeholder
     */
     isPlaceholer: function() {
        var input = document.createElement('input');
        return "placeholder" in input;
    },
    /**
     * setValue replace placeHolder
     */

    setValueForPlaceHolder: function(idSelector) {
        var form = $("#"+idSelector);
        var elements = form.find("input[type='text'][placeholder]");
        elements.each(function() {
            var s = $(this);
            var pValue = s.attr("placeholder");
            var sValue = s.val();
            if (pValue) {
                if (sValue == '') {
                    s.css('color','#aaaaaa');
                    s.val(pValue);
                }
            }
        });
    },
    confirm: function (param) {
        var componentsAlert = $("#componentsAlert") || false;
        var param = param || {};
        param.show = param.show || true; //默认显示
        param.title = param.title || "提示";
        param.message = param.message || "您今日的校验机会已用完，请明天再试！";
        param.btnOk = param.btnOk || "确定";
        param.btnOkFun = param.btnOkFun || function () { };
        param.btnCancelFun = param.btnCancelFun || function () {};
        if (!componentsAlert.html()) {
            var html = '<div class="componentsAlert" id="componentsAlert">';
            html += '<div class="masker"></div>'
            html += '<div class="alert-box">';
            html += '<div class="alert-title">';
            html += '<div class="alert-title-text">'+param.title+'</div>';
            html += '<div class="alert-close-icon" id="AlertBtnClose"></div>';
            html += '</div>';
            html += '<div class="alert-content-box">';
            html += '<div class="alert-content-text">'+ param.message +'</div>';
            html += '<div class="alert-btn-box">';
            html += '<div class="alert-ok-btn" id="AlertBtnOk">'+param.btnOk+'</div>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
            var alertDiv = document.createElement("div");
            alertDiv.innerHTML = html;
            document.body.appendChild(alertDiv);

            componentsAlert =  $("#componentsAlert");
            //绑定事件
            $("#AlertBtnOk").on("click", function(){
                param.btnOkFun();
                componentsAlert.hide();
                componentsAlert.remove();
            });

            $("#AlertBtnClose").on("click", function () {
                param.btnCancelFun();
                componentsAlert.hide();
                componentsAlert.remove();
            })
        }
        if (param.show) {
            $("#componentsAlert").show();
        } else {
            $("#componentsAlert").hide();
        }
    },
    iconConfirm: function (param, isLoginError, urlMsg) {  // urlMsg 超链信息
        isLoginError = false;
        var tipAlert = $("#tipAlert") || false;
        var param = param || {};
        param.show = param.show || true; //默认显示
        param.title = param.title || "提示";
        param.message = param.message || "您今日的校验机会已用完，请明天再试！";
        param.btnOk = param.btnOk || "确定";
        param.btnOkFun = param.btnOkFun || function () { };
        param.closeFun = param.closeFun || function () {};
        if (!tipAlert.html()) {
            var html = '<div id="tipAlert" >';
            if(!isLoginError){
                html += '<div class="masker"></div>';
            }else {
                html += '<div class="masker masker-login"></div>';
            }
            if(!isLoginError){
                html += '<div class="iconComponentsAlert" >';
            }else {
                html += '<div class="iconComponentsAlert iconComponentsAlert-login" >';
            }
            html += '<div class="alert-box">';
            html += '<div class="alert-title">';
            html += '<div class="alert-title-text">提示</div>';
            html += '<div class="alert-close-icon" id="closeTipAlert"></div>';
            html += '</div>';
            html += '<div class="alert-content-box">';
            html += '<div class="alert-img-box" style="display: none"></div>';
            html += '<div class="alert-content" style="width: 100%">';
            html += '<div class="alert-tip">'+param.message+'</div>';
            html += '<div class="alert-action">'+'</div>';
            html += '</div>';
            html += '</div>';
            html += '<div class="alert-btn-box">';
            html += '<div class="alert-ok-btn" id="AlertBtnOk">'+ param.btnOk +'</div>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
            var alertDiv = document.createElement("div");
            alertDiv.innerHTML = html;
            document.body.appendChild(alertDiv);
            tipAlert = $("#tipAlert");
            //绑定事件
            $("#AlertBtnOk").on("click", function(){
                param.btnOkFun();
                tipAlert.hide();
                tipAlert.remove();
            });

            $("#closeTipAlert").on("click", function () {
                param.closeFun();
                tipAlert.hide();
                tipAlert.remove();
            })
            $(".urlMsg").on("click", function () {
                param.closeFun();
                tipAlert.hide();
                tipAlert.remove();
                window.location=urlMsg;
            })
        }
        if (param.show) {
            $("#tipAlert").show();
        } else {
            $("#tipAlert").hide();
        }
    },
    /**
     * 表单不能点击
     * @param id
     * @param bool 是否可点击
     */
    disAbleForm: function (id, bool) {
        var form = $("#"+id);
        var elements = form.find("input[type='text']");

        elements.each(function () {
            var _this = $(this);
            _this.attr("disabled", bool)
        })
    },
    /**
     * 清空当前输入框的值
     */
    clearInputValue: function (selector) {
        var $this = $(''+selector);
        $this.val("");
        if(!utils.isPlaceholer()) {
            setTimeout(function(){
               var pValue = $this.attr("placeholder");
               var sValue = $this.val();
               if (pValue) {
                   if (sValue == '') {
                       $this.css('color','#aeaeae');
                       $this.val(pValue);
                   }
                   if($this.is(":focus")) {
                       $this.css('color','#000');
                       $this.val("");
                   }
               }
           },300)
        }
    },

    setCookie: function (cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        console.info(cname + "=" + cvalue + "; " + expires);
        document.cookie = cname + "=" + cvalue + "; " + expires;
        console.info(document.cookie);
      },
      //获取cookie
      getcookie: function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') c = c.substring(1);
          if (c.indexOf(name) != -1){
            return c.substring(name.length, c.length);
          }
        }
        return "";
      },

    //清除cookie
    clearCookie: function(name) {
        utils.setCookie(name, "", -1);
    },
    /**
     * 清空表单的值
     * ie 下刷新不失去焦点
     */
    clearFormValue: function(selector){
        var form = $(''+selector);
        // var elements = form.find("input[type='text'][placeholder]");
        var elements = form.find("input[type='text'][placeholder]");
        elements.each(function() {
            var $this = $(this);

            if(utils.isIE() || utils.isEDGE()){
                if(utils.isPlaceholer()){
                    setTimeout(function(){
                        $this.val("");
                    },10)
                }else {
                    setTimeout(function(){
                        var pValue = $this.attr("placeholder");
                        var sValue = $this.val();
                        if (pValue) {
                            if (sValue == '') {
                                $this.css('color','#aeaeae');
                                $this.val(pValue);
                            }
                            if($this.is(":focus")) {
                                $this.css('color','#000');
                                $this.val("");
                            }
                        }
                    },300)
                }
            }
        });
    },
   /**
   * 清空表单的值
   * 上面那个不顶用，再写一个
   */
  clearFormValueNew: function(selector) {
    var form = $("" + selector);

    var elements = form.find("input[type='text'][placeholder]");
    var element_tips = form.find(".input-tips")
    element_tips.each(function() {
        var $this = $(this);
        if($this.html()!=''){
            $this.hide();
            $this.html("")
        }
    })

    elements.each(function() {
      var $this = $(this);
      if (utils.isIE() || utils.isEDGE()) {
        if (utils.isPlaceholer()) {
          setTimeout(function() {
            $this.val("");
          }, 10);

        } else {
          setTimeout(function() {
            var pValue = $this.attr("placeholder");
            var sValue = $this.val();

            if (pValue) {
              if (sValue == "") {

                $this.css("color", "#aeaeae");
                $this.val(pValue);
              }
              if ($this.is(":focus")) {

                $this.css("color", "#000");
                $this.val("");
              }
            }
          }, 300);
        }
      }else{

        var pValue = $this.attr("placeholder");
        $this.val('') ;
      }

    });
  },
    /**
     * 发送验证码处理提示信息
     */
    setBtnMsg: function(btn, status){
        //console.log('发送验证码处理提示信息');
        if(utils.btn_status == false){
            //console.log('禁止重复点击.....');
            return true;
        }
        if(status){
            $("" + btn).html('发送中');
            utils.btn_status = false
        }else {
            $("" + btn).html('获取验证码');
            utils.btn_status = true
        }
        return utils.btn_status;

    },
    /**
     * @description 获取当前时间
     */
    getNowTime: function () {
        return new Date().getTime()
    },
    /**
     * @description 神策埋点
     */
    saTrack: function(buryName,distinctId,data){
        var param = {
            toon_type: "200102"  //北京通
        };
        if (/toontype/.test( navigator.userAgent.toLowerCase() )){
            var str = JSON.stringify(navigator.userAgent.toLowerCase());
            var matchResult =/toontype(\/)(\d+)/.exec(str);
            param.toon_type = matchResult[matchResult.length-1];
        }
        for(var key in data){
            if(data.hasOwnProperty(key)===true){
                param[key]=data[key];
            }
        }
        // 这里需要判断是在 App 里还是在普通的浏览器里，例如可以根据 UserAgent 或者 Cookie 来判断
        if (/toon/.test( navigator.userAgent.toLowerCase() )) {
            sa.identify(distinctId);
            //埋点
            sa.quick('autoTrack');
            sa.track(buryName, param);
        } else {
            //埋点
            // sa.quick('autoTrack');
            // sa.track(buryName, param);
        }
    },
    generateOpenUri: function (type) {
        var openUri = "";
        var clientId = utils.sessionData("clientId");
        var redirectUri = utils.sessionData("redirectUri");
        var state = utils.sessionData("state") || "";
        var responseType = utils.sessionData("responseType");
        var scope = utils.sessionData("scope");
        switch(type) {
          case 'login':
              openUri = utils.commonUrl + "open/login/goUserLogin";
              break
          case 'register':
              openUri = utils.commonUrl + "open/login/goUserLogin";
              break
          case 'userCenter':
              openUri = utils.commonUrl + "open/login/goUserLogin";
              break
        }
        openUri += "?client_id="+clientId+"&redirect_uri="+redirectUri+"&response_type="+responseType+"&scope="+scope+"&state="+state;
        return openUri;
    },
    themeList: {
        "default": {
            login: "../login/login.html",
            newLogin: "../login/newLogin.html",
            register: "../register/register.html",
            userInfo: "../basicInfo/myInfo.html"
        },
    },
    logOutFn: function () {
        // 跳转登录页
        var params = {
            clientId: utils.sessionData("clientId") || localStorage.getItem("clientId")
        }
        utils.post({
            url: 'inner/info/doUserLogout',
            data:params,
            success: function(data){
                if(data.meta && data.meta.code == 0){
                    var data = data.data;
                    if(data.nationalLogoutUrl && data.nationalLogoutUrl != ''){
                        window.location.href = data.nationalLogoutUrl;
                    }else{
                        utils.clearCookie('zhengtoon_sso_ticket_cookie');
                        sessionStorage.setItem('refreshFlag','1')
                        localStorage.setItem('refreshFlag','1')
                        window.location.href = utils.themeList['default']['login']+"?pubKey="+pubKey;
                    }
                }else{
                    utils.clearCookie('zhengtoon_sso_ticket_cookie');
                    sessionStorage.setItem('refreshFlag','1')
                    localStorage.setItem('refreshFlag','1')
                    window.location.href = utils.themeList['default']['login']+"?pubKey="+pubKey;
                }
            }
        })
    },
    formatDate(inputDate) {
        // 输入的日期字符串，例如 "20220105"
        // 将其解析为 Date 对象
        var date;
        if(inputDate){
            date = new Date(inputDate);
        }else {
            date = new Date()
        }
        // if((parseInt(inputDate.substr(4, 2)) - 1) > 12){
        //     return ''
        // }
        // if((inputDate.substr(6, 2)) > 31){
        //     return ''
        // }
        // 格式化为 "yyyy-MM-dd"
        var formattedDate = date.getFullYear() + '-' + this.padZero(date.getMonth() + 1) + '-' + this.padZero(date.getDate());
        return formattedDate;
    },
    padZero(value) {
        // 如果月份或日期小于10，添加前导零
        return value < 10 ? '0' + value : value;
    },
};

(function(para) {
    var n = para.name;
    window['sensorsDataAnalytic201505'] = n;
    window[n] = {
        _q: [],
        para: para
    };
})({
    name: 'sa',
    server_url: utils.sensors_server_url
});
