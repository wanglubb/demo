function init() {
    if (isIE(),
    utils.banBlankInput(),
    $("#mask").hide(),
    $("#confirm").hide(),
    $("#confirmBindMobile").hide(),
    $("#confirmBindPwd").hide(),
    callBackUri && "" != callBackUri && ($("#logoBack").show(),
    $("#logoBack").on("click", function() {
        window.location.replace(callBackUri)
    })),
    $("#guojiaUrl").on("click", function() {
        batUrl("nationalLogin")
    }),
    $("#goLegalPerson").on("click", function() {
        window.location.href = "https://yzt.beijing.gov.cn/am/oauth2/authorize?service=bjzwService&response_type=code&client_id=693225666_02&scope=uid+cn+extProperties+reserve3+credenceClass&redirect_uri=http%3A%2F%2Fbanshi.beijing.gov.cn%2Fpubservice%2FYZTAuth"
    }),
    $("#goHelp").on("click", function() {
        window.location.href = "../help/help.html?pubKey=" + pubKey
    }),
    $("#goHelp1").on("click", function() {
        window.location.href = "../help/newHelp.html?pubKey=" + pubKey
    }),
    $("#goHelp2").on("click", function() {
        window.location.href = "../help/help.html?pubKey=" + pubKey
    }),
    $("#alipayUrl").on("click", function() {
        batUrl("alipay")
    }),
    $("#wechatUrl").on("click", function() {
        batUrl("wechat")
    }),
    $("#baiduUrl").on("click", function() {
        batUrl("baidu")
    }),
    $("#esscUrl").on("click", function() {
        batUrl("essc")
    }),
    closeConfirm(),
    $("#imgCode").attr("src", captchaUrl + Math.random()),
    initPwdLogin(),
    canSendData = !0,
    $(document).width() <= 1225) {
        var e = 1225 - $(document).width();
        $(".login-container").css("margin-right", e),
        $("#confirm-message-login").hide()
    }
    $("#intoDialog").hide(),
    $(".header-wrapper,#content,.sidebarbox,.footer-wrapper").removeClass("blur")
}
function batUrl(e) {
    utils.post({
        url: "inner/client/getCertLoginUrl",
        needJson: !1,
        data: {
            clientId: utils.sessionData("clientId"),
            loginFrom: e
        },
        success: function(e) {
            0 == e.meta.code ? window.location.href = e.data : "5020" === e.meta.code && ($("#invalid-error-box").show(),
            $("#login-error-box").hide())
        },
        error: function(e) {
            console.log(e)
        }
    })
}
function bindEVent() {
    $("#username").on("focus", function() {
        utils.saTrack("PBEnterName", "", {
            source_page: "账号登录"
        })
    }),
    $("#password").on("focus", function() {
        utils.saTrack("BEnterPassWord", "", {
            source_page: "账号登录"
        })
    }),
    $("#account-img-code").on("focus", function() {
        utils.saTrack("PBCaphicCoad", "", {
            source_page: "账号登录"
        })
    }),
    $("#imgCode").on("click", function() {
        $(this).attr("src", captchaUrl + Math.random()),
        utils.saTrack("PBCCaphicCoad", "", {
            source_page: "账号登录"
        })
    }),
    $("#phone").on("focus", function() {
        utils.saTrack("PBEnterName", "", {
            source_page: "短信登录"
        })
    }),
    $("#message-img-code").on("focus", function() {
        utils.saTrack("PBCaphicCoad", "", {
            source_page: "短信登录"
        })
    }),
    $("#imgCodes").on("click", function() {
        $(this).attr("src", captchaUrl + Math.random()),
        utils.saTrack("PBCCaphicCoad", "", {
            source_page: "短信登录"
        })
    }),
    $("#message-ver-code").on("focus", function() {
        utils.saTrack("PBInputCode", "", {
            source_page: "短信登录"
        })
    }),
    $("#get-verif-code").click(function() {
        sendCode(),
        utils.saTrack("PBGetCode", "", {
            source_page: "短信登录"
        })
    }),
    $(".closeTltBtn").click(function() {
        $("#confirmTlt").hide()
    })
}
function isIE() {
    var e = navigator.userAgent;
    e.indexOf("compatible") > -1 && e.indexOf("MSIE") > -1 && (isIEModel = !0,
    $("#password-box").html('<div class="cover-input-box"><input type="password" onkeyup="canPwdLogin()" onblur="canPwdLogin()"  id="password"  maxlength="20"  autocomplete="off" ><div class="ie-icon-cover"></div></div>'))
}
function clearLoginForm() {
    $("#username").val(""),
    $("#password").val("").parent().parent().parent().removeClass("hide-msg"),
    $("#account-img-code").val(""),
    utils.clearFormValue("#account-login-box")
}
function closeConfirm() {
    $("#closeBtn").on("click", function() {
        $("#mask").hide(),
        $("#confirm").hide(),
        $("#login-error-box").hide(),
        $("#imgCode").attr("src", utils.commonUrl + "common/generateCaptcha?r=" + Math.random()),
        clearLoginForm()
    })
}
function addMobile() {
    $("#confirmBtn").on("click", function() {
        window.location.href = "../bindMobile/bindMobile.html?pubKey=" + pubKey
    })
}
function showConfirm() {
    "false" === utils.sessionData("firstBrowse") && (utils.sessionData("firstBrowse", "true"),
    $("#mask").show(),
    $("#confirm").show())
}
function initPwdLogin() {
    $("#message-login-box").hide(),
    $("#account-login-box").show(),
    $("#forget-pwd-btn").show(),
    $("#actLine").removeClass("hide"),
    clearLoginForm(),
    $("#imgCode").attr("src", utils.commonUrl + "common/generateCaptcha?r=" + Math.random()),
    $("#username, #password, #account-img-code").on("paste", function() {
        canPwdLogin()
    }),
    isPwdLogin = !0
}
function initSmsLogin() {
    $("#account-login-box").hide(),
    $("#forget-pwd-btn").hide(),
    $("#actLine").addClass("hide"),
    $("#message-login-box").show(),
    $("#phone").val(""),
    $("#message-img-code").val(""),
    $("#message-ver-code").val(""),
    utils.clearFormValue("#message-login-box"),
    timer && (clearInterval(timer),
    canSendCode = !0,
    $("#get-verif-code").text("获取验证码")),
    $("#phone, #message-img-code, #message-ver-code").on("paste", function() {
        canMsgLogin()
    }),
    $("#imgCodes").attr("src", utils.commonUrl + "common/generateCaptcha?r=" + Math.random()),
    isPwdLogin = !1
}
function bindMessage(e) {
    $("#mask").show(),
    $("#confirmBindMobile").show(),
    $("#confirmBindMobileBtn").on("click", function() {
        window.location.href = "../bindMobile/bindMessage.html?pubKey=" + publicKey + "&code=" + e
    })
}
function bindMessageMobile(e) {
    $("#mask").show(),
    $("#confirmBindMobile2").show(),
    $("#confirmBindMobileBtn2").on("click", function() {
        window.location.href = "../bindMobile/bindPhone.html?pubKey=" + publicKey + "&code=" + e
    })
}
/**
 * 通过密码登录的函数
 * 该函数处理密码登录的逻辑，包括表单验证、数据加密、请求发送和响应处理
 */
/**
    // 调用utils.saTrack方法进行数据埋点，记录"账号登录"页面的登录行为
 * 通过密码进行登录的函数
 * 该函数处理密码登录的逻辑，包括数据验证、加密请求和响应处理
 */
function loginByPwd() {
    if (utils.saTrack("PBDimenCode", "", {
        source_page: "账号登录"
    }),
    !canSendData)
        return !1;
    if (pwdIsEmpty)
        return !1;
    var e = $("#username").val()
      , o = $("#password").val()
      , i = $("#account-img-code").val()
      , t = {
        userIdentity: e,
        resetFlag: !1,
        encryptedPwd: hex_md5(o)
    }
      , n = /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{8,20}$/;
    n.test($("#password").val()) || (t.resetFlag = !0);
    var a = utils.getEncryptedData(publicKey, t);
    canSendData = !1,
    utils.post({
        url: "inner/login/doUserLoginByPwd",
        needJson: !1,
        data: {
            encryptData: a,
            captcha: i
        },
        success: function(e) {
            if (e.meta && "6117" === e.meta.code || e.meta && "6127" === e.meta.code || e.meta && "6115" === e.meta.code)
                return void bindMessageMobile();
            if (e.meta && "0" === e.meta.code)
                getRedirectUri();
            else if ("6109" === e.meta.code)
                $("#mask").show(),
                $("#confirm").show(),
                $("#login-error-box").hide(),
                canSendData = !0;
            else if ("5020" === e.meta.code)
                $("#invalid-error-box").show(),
                $("#login-error-box").hide();
            else {
                if (e.meta && "6115" === e.meta.code || "6116" === e.meta.code || "6117" === e.meta.code)
                    return void bindMessage(e.meta.code);
                e.meta && "5031" === e.meta.code ? ($("#confirmBindPwd").show(),
                setTimeout(function() {
                    window.location.href = "../editPassword/editPwd.html?pubKey=" + publicKey + "&editType=login&mobile=" + e.meta.message
                }, 2e3)) : (e.meta && "5019" === e.meta.code && (e.meta.message.indexOf("密码输入错误5次，已被锁定1小时，请尝试找回密码。") > -1 && utils.iconConfirm({
                    message: '密码输入错误5次，已被锁定1小时，请尝试<span class="urlMsg">找回密码</span>。'
                }, !0, "../forgetPwd/forgetPwd.html?pubKey=" + publicKey),
                e.meta.message.indexOf("密码输入错误10次，已被锁定24小时，请尝试找回密码。") > -1 && utils.iconConfirm({
                    message: '密码输入错误10次，已被锁定24小时，请尝试<span class="urlMsg">找回密码</span>。'
                }, !0, "../forgetPwd/forgetPwd.html?pubKey=" + publicKey)),
                $("#invalid-error-box").hide(),
                $("#login-error-box").show().text("当前手机号还有n次接收验证码的机会"),
                $("#imgCode").attr("src", utils.commonUrl + "common/generateCaptcha?r=" + Math.random()),
                utils.clearInputValue("#account-img-code"),
                $("#login-btn").addClass("disable"),
                showErrors(e.meta.message),
                canPwdLogin(),
                canSendData = !0)
            }
        },
        error: function() {
            canSendData = !0
        }
    })
}
function loginBySms() {
    utils.saTrack("PBDimenCode", "", {
        source_page: "短信登录"
    });
    var e = $("#phone").val()
      , o = $("#message-ver-code").val();
    if (canSendData && !mesIsEmpty) {
        if (Validator.mobilePhoneText(e) === !1)
            return showErrors("手机号格式有误，请核对后重新输入"),
            !1;
        if (Validator.codeText(o) === !1)
            return showErrors("验证码格式不正确"),
            !1;
        var i = {
            mobile: e,
            smsCode: o
        }
          , t = utils.getEncryptedData(publicKey, i);
        canSendData = !1,
        utils.post({
            url: "inner/login/doUserLoginBySms",
            needJson: !1,
            data: {
                encryptData: t
            },
            success: function(e) {
                if (e.meta && "0" === e.meta.code)
                    getRedirectUri();
                else {
                    if (e.meta && "6115" === e.meta.code || "6116" === e.meta.code || "6117" === e.meta.code)
                        return void bindMessage(e.meta.code);
                    canSendData = !0,
                    showErrors(e.meta.message),
                    utils.clearInputValue("#message-img-code"),
                    $("#imgCodes").attr("src", utils.commonUrl + "common/generateCaptcha?r=" + Math.random()),
                    $("#login-btn").addClass("disable")
                }
            },
            error: function() {
                canSendData = !0
            }
        })
    }
}
function canPwdLogin() {
    $("#username").val() && "用户名/手机号/身份证号" != $("#username").val() && $("#password").val() && $("#account-img-code").val() && "请输入图形验证码" != $("#account-img-code").val() ? ($("#login-btn").removeClass("disable"),
    pwdIsEmpty = !1) : ($("#login-btn").addClass("disable"),
    pwdIsEmpty = !0)
}
function canMsgLogin() {
    $("#phone").val() && "请输入手机号" != $("#phone").val() && $("#message-img-code").val() && "请输入图形验证码" != $("#message-img-code").val() && $("#message-ver-code").val() && "请输入验证码" != $("#message-ver-code").val() ? ($("#login-btn").removeClass("disable"),
    mesIsEmpty = !1) : ($("#login-btn").addClass("disable"),
    mesIsEmpty = !0)
}
function sendCode() {
    if (canSendCode) {
        var e = $("#phone").val()
          , o = $("#message-img-code").val();
        if (!e)
            return void showErrors("请输入手机号");
        if (!Validator.mobilePhoneText(e))
            return void showErrors("手机号格式有误，请核对后重新输入");
        if (!o)
            return void showErrors("请输入图形验证码");
        if (!Validator.codeText(o))
            return void showErrors("请输入正确的图形验证码");
        showErrors("");
        var i = {
            mobile: e,
            captcha: o,
            smsType: utils.sms_login_type
        };
        return utils.setBtnMsg("#get-verif-code", !0) ? !1 : void utils.post({
            url: "inner/common/sendSms",
            data: i,
            needJson: !1,
            success: function(e) {
                utils.btn_status = !0,
                e.meta && "0" === e.meta.code ? countdown("#get-verif-code") : (utils.setBtnMsg("#get-verif-code", !1),
                showErrors(e.meta.message),
                utils.clearInputValue("#message-img-code"),
                canMsgLogin(),
                $("#login-btn").addClass("disable"),
                $("#imgCodes").attr("src", utils.commonUrl + "common/generateCaptcha?r=" + Math.random()))
            }
        })
    }
}
function showErrors(e) {
    e ? ($("#login-error-box").show(),
    $("#login-error-box").html(e)) : $("#login-error-box").hide()
}
function countdown(e) {
    var o = 60;
    canSendCode = !1,
    timer = setInterval(function() {
        1 == o ? (clearInterval(timer),
        $("" + e).html("获取验证码"),
        canSendCode = !0) : (--o,
        $("" + e).html("重新发送(" + o + ")"))
    }, 1e3)
}
function checkPhone() {
    var e = /^1\d{10}$/
      , o = $("#phone").val();
    if (e.test(o)) {
        showErrors("");
        var i = {
            mobile: o
        }
          , t = utils.getEncryptedData(publicKey, i);
        utils.post({
            url: "inner/login/checkMobile",
            async: !1,
            needJson: !1,
            data: {
                encryptData: t
            },
            success: function(e) {
                e.meta && "0" === e.meta.code ? checkMobile = !0 : "5020" === e.meta.code ? ($("#invalid-error-box").show(),
                $("#login-error-box").hide()) : (showErrors(e.meta.message),
                checkMobile = !1)
            }
        })
    }
}
function getRedirectUri() {
    var e = {
        clientId: utils.sessionData("clientId"),
        state: utils.sessionData("state"),
        bizType: utils.sessionData("bizType"),
        authCode: "login"
    };
    utils.post({
        url: "inner/info/getRedirectUri?" + utils.getNowTime(),
        needJson: !1,
        data: e,
        success: function(e) {
            if (canSendData = !0,
            "0" === e.meta.code) {
                var e = e.data
                  , o = e.certLevel
                  , i = e.grantLevel
                  , t = e.certName || ""
                  , n = e.certNo || "";
                utils.sessionData("certNoType", e.certNoType);
                var a = "0";
                if ("L33" == i || "L31" == i && "L31" != o)
                    return void (window.location.href = "../certification/faceIdent.html");
                if ("L3" == i)
                    if ("L3" == o || "L31" == o || "L32" == o)
                        a = "1";
                    else if ("L1" == o || "L2" == o)
                        return void (window.location.href = "../certification/faceIdent.html");
                if (o >= i || "1" == a)
                    if (e.implicitLoginUrl && "" != e.implicitLoginUrl)
                        window.location.href = e.implicitLoginUrl;
                    else if (e.redirectTextSwitch && 1 == e.redirectTextSwitch) {
                        $("#closeDialog").on("click", function() {
                            $("#closeDialog").hide(),
                            $("#initDialog").show(),
                            window.location.href = e.homePageUrl
                        }),
                        $(".dialogMain").text(e.redirectText),
                        $("#intoDialog").show(),
                        $(".header-wrapper,#content,.sidebarbox,.footer-wrapper").addClass("blur");
                        var r = 10;
                        timer = setInterval(function() {
                            1 == r ? (clearInterval(timer),
                            window.location.href = e.homePageUrl) : (--r,
                            $("#timer").html(r + "s"))
                        }, 1e3)
                    } else
                        window.location.href = e.homePageUrl;
                else
                    "L2" === i && utils.sessionData("certType", "2"),
                    "L32" == i && (utils.sessionData("certType", "3"),
                    utils.sessionData("certName", t),
                    utils.sessionData("certNo", n)),
                    "L31" === i && utils.sessionData("certType", "31"),
                    window.location.href = "../certification/certification.html?pubKey=" + publicKey
            }
        }
    })
}
function pdfWindowFn() {
    $("#my_iframe").attr("src", "./operationManual.pdf"),
    $("#window_box").show()
}
function pdfCloseFn() {
    $("#window_box").hide()
}
var isPwdLogin = !0
  , publicKey = utils.getQueryStringHr("pubKey") || utils.sessionData("pubKey") || window.localStorage.getItem("pubKey")
  , callBackUri = utils.sessionData("callBackUri")
  , timer = ""
  , canSendCode = !0
  , canSendData = !0
  , pwdIsEmpty = !0
  , mesIsEmpty = !1
  , checkMobile = !1
  , isIEModel = !1
  , captchaUrl = utils.commonUrl + "common/generateCaptcha?r=";
init(),
bindEVent(),
$(".tabs-item").on("click", function() {
    if ($("#login-btn").addClass("disable"),
    showErrors(""),
    0 == $(this).index()) {
        if (isPwdLogin)
            return;
        initPwdLogin()
    } else {
        if (!isPwdLogin)
            return;
        initSmsLogin()
    }
}),
$("#account-login-icon").on("click", function() {
    init()
}),
$("#username").on("keyup", function() {
    var e = $(this).val()
      , o = this;
    Validator.checkIdcard(e) && $(o).val(e.toUpperCase())
}),
$("#login-btn").on("click", function() {
    isPwdLogin ? loginByPwd() : loginBySms()
}),
$("#register-btn").on("click", function() {
    isPwdLogin ? utils.saTrack("PBZHRegister", "", {
        source_page: "账号登录"
    }) : utils.saTrack("PBZHRegister", "", {
        source_page: "短信登录"
    }),
    window.location.href = "../register/register.html?pubKey=" + publicKey
}),
$("#forget-pwd-btn").on("click", function() {
    utils.saTrack("PBZHBPassword", "", {
        source_page: "账号登录"
    }),
    window.location.href = "../forgetPwd/forgetPwd.html?pubKey=" + publicKey
});
var qrCodeLogin = {
    data: {
        key: "",
        status: "",
        qrTimer: 0,
        qrInterval: 2e3
    },
    init: function() {
        var e = localStorage.getItem("refreshFlag") || sessionStorage.getItem("refreshFlag");
        "1" == e ? (this.bindEvents(),
        sessionStorage.setItem("refreshFlag", "2"),
        localStorage.setItem("refreshFlag", "2")) : "2" == e && utils.post({
            url: "inner/login/refreshLogin",
            needJson: !1,
            success: function(e) {
                if (e.meta && "0" == e.meta.code) {
                    var e = e.data;
                    e.loginStatus && 1 == e.loginStatus ? getRedirectUri() : e.loginStatus && 0 == e.loginStatus && (e.nationalLoginTrustUrl && "" != e.nationalLoginTrustUrl ? window.location.href = e.nationalLoginTrustUrl : (sessionStorage.setItem("refreshFlag", "1"),
                    localStorage.setItem("refreshFlag", "1"),
                    window.location.href = utils.themeList["default"].login + "?pubKey=" + publicKey))
                } else
                    "5020" === e.meta.code ? ($("#invalid-error-box").show(),
                    $("#login-error-box").hide()) : this.bindEvents()
            },
            error: function() {}
        })
    },
    bindEvents: function() {
        var e = this;
        $("#qr-login-icon").on("click", function() {
            e.initQRCodeLogin(),
            utils.saTrack("PBClickQR", "", {})
        }),
        $("#qr-invalid-marker").on("click", function() {
            e.initQRCodeLogin(),
            utils.saTrack("PBQRCodeReBresh", "", {})
        }),
        $("#qr-busy-marker").on("click", function() {
            $("#qr-busy-marker").hide(),
            e.initQRCodeLogin(),
            utils.saTrack("PBQRCodeReBresh", "", {})
        }),
        $("#account-login-icon").on("click", function() {
            clearInterval(e.data.qrTimer),
            $("#qrCode-box").hide(),
            utils.saTrack("PBPCAccButton", "", {})
        })
    },
    initQRCodeLogin: function() {
        $("#qrCode-box").show(),
        $("#qr-scan-success-marker").hide(),
        $("#qr-invalid-marker").hide(),
        $("#login-error-box").html(""),
        this.getQrCode()
    },
    getQrCode: function() {
        var e = this;
        utils.get({
            url: "inner/qr/getQrCode?" + utils.getNowTime(),
            needJson: !1,
            data: {
                clientId: utils.sessionData("clientId")
            },
            success: function(o) {
                o.meta && "0" === o.meta.code && (e.data.key = o.data.key,
                $("#qr").attr("src", "data:image/png;base64," + o.data.image).show(),
                e.getQrCodeStatus(),
                $("#scanTip").hide(),
                1 == o.data.scanType),
                ("201" === o.meta.code || "5000" === o.meta.code) && $("#scanTip").show(),
                "5020" === o.meta.code && ($("#invalid-error-box").show(),
                $("#login-error-box").hide()),
                "8006" === o.meta.code && $("#qr-busy-marker").show()
            }
        })
    },
    getQrCodeStatus: function() {
        var e = this;
        this.data.qrTimer = setInterval(function() {
            utils.get({
                url: "inner/qr/getQrCodeStatus?" + utils.getNowTime(),
                needJson: !1,
                data: {
                    key: e.data.key
                },
                success: function(o) {
                    $("#scanTip").hide();
                    var i = o.meta && o.meta.code;
                    if ("0" === i) {
                        var t = o.data && o.data.status;
                        "2" === t && $("#qr-scan-success-marker").show(),
                        "3" === t && (clearInterval(e.data.qrTimer),
                        getRedirectUri())
                    } else
                        $("#qr-scan-success-marker").hide(),
                        $("#qr-invalid-marker").show(),
                        $("#qr-busy-marker").hide(),
                        clearInterval(e.data.qrTimer)
                }
            })
        }, this.data.qrInterval)
    }
};
qrCodeLogin.init(),
"1" == utils.login_scan_type && ($("#qrCode-box").show(),
$("#qr-scan-success-marker").hide(),
$("#qr-invalid-marker").hide(),
$("#logo-bottom-help").hide(),
qrCodeLogin.getQrCode()),
utils.get({
    url: "inner/third/showThirdBtn?r=" + +new Date,
    needJson: !1,
    success: function(e) {
        e.meta && "0" === e.meta.code && ($("#actBox").addClass("third-party-box"),
        $("#thirdPartyBtn").on("click", function() {
            window.location.href = e.data.loginUri + "?pubKey=" + publicKey
        }),
        e.data.loginName && "" != e.data.loginName && $("#thirdPartyName").text(e.data.loginName),
        e.data.scrollbar && "" != e.data.scrollbar && $(".tipsTxt").text(e.data.scrollbar),
        e.data.tips && "" != e.data.tips)
    }
});
