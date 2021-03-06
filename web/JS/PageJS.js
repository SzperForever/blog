$(function () {
    IndexIMGControl.run();
    InfoCard.run();

    // var handle;
    // window.addEventListener('popstate', function (event) {
    //     clearTimeout(handle);
    //     console.log(event.state);
    //     if (event.state != null) {
    //         var func = eval(event.state['html'] + '()');
    //     }
    //     else {
    //         $('#display-area>div').css({
    //             'top': 0,
    //             'transition': 'top 1600ms cubic-bezier(0.175, 0.885, 0.255, 1.12) 10ms'
    //         });
    //         handle = setTimeout(function () {
    //             $('#display-area').empty();
    //         }, 1600);
    //     }
    // });
});


function loadName(blogername) {
    var name = blogername.text();
    var len = name.length;
    var size = 8 / len;
    var infocard = $('#info-card');
    var width = infocard.width();
    blogername.css({'font-size': '' + 4.5 * size * (width / 230) + 'em'});
}

//首页背景图片控制
var IndexIMGControl = {
    count: 0,           //图片叙述计数
    imgPath: undefined, //图片路径数组
    imgNum: 0,          //图片数量
    run: function () {  //执行函数
        $.ajax({
            dataType: 'json',
            url: '/getIndexIMG.form',
            success: function (data) {
                IndexIMGControl.imgPath = data;
                IndexIMGControl.imgNum = data.length;
                IndexIMGControl.animate();
                //鼠标移动特效
                $('#background-pic').mousemove(function (e) {
                    IndexIMGControl.move(e);
                });
                //每10s调用一次动画函数
                setInterval('IndexIMGControl.animate()', 10000);
            }
        })
    },
    animate: function () {
        $('#background-pic').css({
            'background': 'url(' + this.imgPath[this.count] + ') no-repeat fixed center',
            'animation': 'img-scale 10s linear infinite forwards ',
            'background-size': 'cover'
        });
        $('#info-card-background').css({
            'background': 'url(' + this.imgPath[this.count] + ') no-repeat fixed center',
            'animation': 'img-scale 10s linear infinite forwards ',
            'background-size': 'cover'
        });
        this.count = (this.count + 1) % this.imgNum;
    },
    pre_x: undefined,
    pre_y: undefined,
    //鼠标移动特效
    move: function (e) {
        var x = e.pageX;
        var y = e.pageY;
        if (this.pre_x != undefined && this.pre_y != undefined) {
            $('#background-container').css({
                'transform': 'translate(' + -(x - this.pre_x) / 100 + 'px,' + -(y - this.pre_y) / 100 + 'px)'
            });
            $('#info-card-background-move').css({
                'transform': 'translate(' + -(x - this.pre_x) / 100 + 'px,' + -(y - this.pre_y) / 100 + 'px)'
            });
        }
        else {
            this.pre_x = innerWidth / 2;
            this.pre_y = innerHeight / 2;
        }
    }
};

var InfoCard = {
    run: function () {
        InfoCard.loadInfo();
        InfoCard.blur_control()
    },
    loadInfo: function () {
        $.ajax({
            dataType: 'json',
            url: '/getInfo.form',
            success: function (data) {
                InfoCard.writeData(data);
            }
        })
    },
    writeData: function (data) {
        $('#head-pic').css({
            'background': 'url(' + data['head_pic_path'] + ') no-repeat center',
            'background-size': 'cover'
        });
        var bloger_name = $('#bloger-name'), quoto = $('#quoto');
        bloger_name.text(data['bloger_name']);
        bloger_name.css('font-family', data['name_font']);
        quoto.text(data['quoto']);
        quoto.css('font-family', data['quoto_font']);
        // 名字自适应大小,磨砂背景自适应
        $(window).resize(function () {
            InfoCard.name_size_control(bloger_name);
            InfoCard.blur_control();
        });
        var index = ["qq", "wechat", "github", "email", "blog"];
        var dict = {"qq": "QQ", "wechat": "WeChat", "github": "Github", "email": "Email", "blog": "Blog"};
        //设定宽度相关
        var effective_count = 0;
        for (var i = 0; i < index.length; ++i) {
            if (data[index[i]] != "none") {
                if (index[i] == "blog") {
                    $('#info-footer').append(
                        '<span id="' + index[i] + '-logo"><img src="IMG/' + dict[index[i]] + '-Logo.png"></span>'
                    );
                    $('#blog-logo').click(function () {
                        page_switch_control.load_blog_page(false);
                    });
                }
                else {
                    $('#info-footer').append(
                        '<span id="' + index[i] + '-logo"><a href="' + data[index[i]] + '"><img src="IMG/' + dict[index[i]] + '-Logo.png"></a></span>'
                    );
                }
                effective_count += 1;
            }
        }

        $('#info-footer').find('span>a>img').css('max-width', (effective_count * 20) > 80 ? (effective_count * 20) : 80 + '%');
        $('#info-footer').find('span>img').css('max-width', (effective_count * 20) > 80 ? (effective_count * 20) : 80 + '%');
    },
    name_size_control: function (blogername) {
        var name = blogername.text();
        var len = name.length;
        var size = 8 / len;
        var infocard = $('#info-card');
        var width = infocard.width();
        blogername.css({'font-size': '' + 4.5 * size * (width / 230) + 'em'});
    }
    ,
    blur_control: function () {
        var info_card = $('#info-card');
        var width = info_card.width();
        var height = info_card.height();
        var top = info_card.position()['top'];
        var margin_left = (info_card.outerWidth(true) - width) / 2;
        $('#info-card-background-container').css({
            'width': width,
            'height': height,
            'top': top,
            'margin-left': margin_left
        })

    }
};

$(function () {
    page_switch_control.next_back_control();
});

var page_switch_control = {
    cache: {},
    next_back_control: function () {
        window.addEventListener('popstate', function (event) {
            var pre_url = page_switch_control.cache['pre_url'];
            //后退要执行state中的back函数，back函数可以把添加的内容去掉
            if (pre_url == null || event.state == null || pre_url.length > window.location.href.length) {//back
                //后退动作
                if (event.state == null) {
                    page_switch_control.blog_page_disappear();
                }
                else {
                    eval(event.state['html']['back'] + "()");
                }
                if (event.state != null && event.state['html']['back'] != "")
                    console.log('back,the function is ' + event.state['html']['back'] + '()');
            }
            else {
                eval(event.state['html']['forward'] + "()");
                console.log('forward,the function is ' + event.state['html']['back'] + '()');
            }
            page_switch_control.cache['pre_url'] = window.location.href;
        });
    },
    url_route: function (new_url, new_title, html) {
        var state = {
            url: window.document.location.href,
            title: window.document.title,
            html: html
        };
        window.history.pushState(state, new_title, new_url);
    },
    load_blog_page: function () {

        if (page_switch_control.cache['blog_page'] != null) {
            data = page_switch_control.cache['blog_page'];
            load_object.blog_page(data);
        }
        else {
            $.ajax({
                dataType: 'html',
                url: '/getDisplayArea.form',
                success: function (data) {
                    page_switch_control.cache['blog_page'] = data;
                    load_object.blog_page(data);
                    page_switch_control.url_route(
                        window.document.location.href + 'blog',
                        'leehaoze\'s blog',
                        {
                            'forward': 'page_switch_control.load_blog_page',//前进到这一页面执行的函数名
                            'back': ''//后退到这一页面执行的函数
                        }
                    )
                }
            })
        }

        $(window).resize(function () {
            var background_height = $('#background-color').height();
            $('#main-content').css({
                'top': '-' + (background_height + $('#info-card').height() - window.innerHeight * 0.02),
                'transition': 'top 1600ms cubic-bezier(0.175, 0.885, 0.255, 1.12) 10ms'
            });
        });

        if (page_switch_control.cache['head_pic'] != null) {
            var data = page_switch_control.cache['head_pic'];
            load_object.head_pic(data);
        }
        else {
            $.ajax({
                dataType: 'text',
                url: '/getHeadPic.form',
                success: function (data) {
                    page_switch_control.cache['head_pic'] = data;
                }
            })
        }


        if (page_switch_control.cache['type_menu'] != null) {
            var data = page_switch_control.cache['type_menu'];
            load_object.type_menu(data)
        }
        else {
            $.ajax({
                dataType: 'json',
                url: '/getAllTypes.form',
                success: function (data) {
                    page_switch_control.cache['type_menu'] = data;
                    load_object.type_menu(data)
                }
            })
        }
    },
    blog_page_disappear: function () {
        // $('#display-area>div').animate({'top': 0}, 1600, 'linear', function () {
        //     $('#display-area').empty();
        // });
        $('#display-area>div').css({
            'top': 0,
            'transition': 'top 2600ms cubic-bezier(0.175, 0.885, 0.255, 1.12) 10ms'
        });
        $('#display-area>div').one('transitionend', function(){
            $('#display-area').empty();
        });
        // $('#display-area>div').bind('transitionend',function () { $('#display-area').empty(); })
    },
    load_article_list: function (type_id) {
        if (page_switch_control.cache['articile_list_of_' + type_id] != null) {
            var data = page_switch_control.cache['articile_list_of_' + type_id];
            load_object.article_list(data);
        }
        else {
            $.ajax({
                dataType: 'json',
                url: '/getArticleList/' + type_id + '.form',
                success: function (data) {
                    page_switch_control.cache['articile_list_of_' + type_id] = data;
                    load_object.article_list(data);
                    page_switch_control.url_route(
                        window.document.location.href + '/type#' + type_id,
                        null,
                        '#type-' + type_id
                    )
                }
            })
        }
    }
};


var load_object = {
    blog_page: function (data) {
        $('#display-area').append(data);
        $('#display-area>div').unbind();
        var background_height = $('#background-color').height();
        $('#main-content').css({
            'top': '-' + (background_height + $('#info-card').height() - window.innerHeight * 0.02),
            'transition': 'top 1600ms cubic-bezier(0.175, 0.885, 0.255, 1.12) 10ms'
        });
    },
    head_pic: function (data) {
        $('#head-pic-small').css({
            'background': 'url(' + data + ')  no-repeat center',
            'background-size': 'cover'
        });
    },
    type_menu: function (data) {
        $('.type').each(function () {
            $(this).remove();
        })
        for (var i = 0; i < data.length; ++i) {
            var value = data[i];
            $('#menu-content').append(
                '<span class="type" id="type-' + value['id'] + '">' +
                '<img src="IMG/' + value['picPath'] + '" style="width: 23px;margin-right: 8px;">' +
                '<span>' + value['name'] + '</span>' +
                '<span class="type-id" style="display: none">' + value['id'] + '</span>' +
                '</span>'
            )
        }
        $('.type').each(function () {
            $(this).click(function () {
                page_switch_control.load_article_list($(this).find('.type-id').text());
            })
        })
    },
    article_list: function (data) {
        $('#article-list').empty();
        for (var i = 0; i < data.length; ++i) {
            var value = data[i];
            $('#article-list').append(
                '<span class="article-title" style="left:' + (i + 2) * 70 + 'px;">' +
                '<span class="article-name">' + value['title'] + '</span>' +
                '<span class="article-id" style="display: none">' + value['id'] + '</span>' +
                '</span>'
            )
        }
        $('.article-title').each(function () {
            $(this).animate({
                'left': 0
            }, 400)
        })
    }
};

var page_switch_control_new = {
    load_blog_page: function (replay) {
        $('#display-area').load("/getDisplayArea.form", function () {
            var background_height = $('#background-color').height();
            $('#main-content').css({
                'top': '-' + (background_height + $('#info-card').height() - window.innerHeight * 0.02),
                'transition': 'top 1600ms cubic-bezier(0.175, 0.885, 0.255, 1.12) 10ms'
            });

            if (replay == false) {

                var state = {
                    url: window.document.location.href,
                    title: window.document.title,
                    html: 'page_switch_control.load_blog_page'
                };
                window.history.pushState(state, null, window.document.location.href + "blog");
            }
            blog_page_control.page_resize(replay);
            blog_page_control.load_head_pic(replay);
            blog_page_control.load_type_menu(replay);
        });
    }
};


var blog_page_control = {
    cache: {},
    page_resize: function () {
        $(window).resize(function () {
            var background_height = $('#background-color').height();
            $('#main-content').css({
                'top': '-' + (background_height + $('#info-card').height() - window.innerHeight * 0.02),
                'transition': 'top 1600ms cubic-bezier(0.175, 0.885, 0.255, 1.12) 10ms'
            });
        })
    },
    load_head_pic: function (replay) {
        if (replay) {
            $('#head-pic-small').css({
                'background': 'url(' + blog_page_control.cache['head_pic'] + ')  no-repeat center',
                'background-size': 'cover'
            })
        }
        else {
            $.ajax({
                dataType: 'text',
                url: '/getHeadPic.form',
                success: function (data) {
                    $('#head-pic-small').css({
                        'background': 'url(' + data + ')  no-repeat center',
                        'background-size': 'cover'
                    });
                    blog_page_control.cache['head_pic'] = data;
                }
            })
        }
    },
    load_type_menu: function (repaly) {
        if (!repaly) {
            $.ajax({
                dataType: 'json',
                url: '/getAllTypes.form',
                success: function (data) {
                    blog_page_control.cache['type_data'] = data;

                }
            })
        }
        else {
            for (var i = 0; i < blog_page_control.cache['type_data'].length; ++i) {
                var value = blog_page_control.cache['type_data'][i];
                $('#menu-content').append(
                    '<span class="type">' +
                    '<img src="IMG/' + value['picPath'] + '" style="width: 23px;margin-right: 8px;">' +
                    '<span>' + value['name'] + '</span>' +
                    '<span class="type-id" style="display: none">' + value['id'] + '</span>' +
                    '</span>'
                )
            }
            blog_page_control.register_type_menu_click();
        }
    },
    register_type_menu_click: function (reclick_type_id) { //再前进后退是要模拟用户点击了某个Type
        if (reclick_type_id = null) {
            $('.type').each(function () {
                $(this).click(function () {
                    var type_id = $(this).find('.type-id').text();
                    $.ajax({
                        dataType: 'json',
                        url: '/getArticleList/' + type_id + '.form',
                        success: function (data) {
                            $('#article-list').empty();
                            $.each(data, function (index, value) {
                                $('#article-list').append(
                                    '<span class="article-title">' +
                                    '<span class="article-name">' + value['title'] + '</span>' +
                                    '<span class="article-id" style="display: none">' + value['id'] + '</span>' +
                                    '</span>'
                                )
                            });
                            blog_page_control.register_article_menu_click();
                        }
                    })
                })
            })
        } else {

        }
    },
    register_article_menu_click: function () {
        $('.article-title').each(function () {
            $(this).click(function () {
                var article_id = $(this).find('.article-id').text();
                $.ajax({
                    dataType: 'json',
                    url: '/getArticle/' + article_id + '.form',
                    success: function (data) {
                        console.log(data)
                        $('#line-three').append(data['content']);
                    }
                })
            })
        })
    }
};

var AJAX = {
    Url: "",
    Type: "",
    DataType: null,
    postdata: null,
    getdata: null,
    Get: function (Type, dataType, url, postdata, getdata) {
        this.ajaxSet(Type, dataType, url, postdata, getdata);
        $.ajax({
            url: this.Url,
            type: this.Type,
            contentType: "application/json; charset=utf-8",
            data: this.postdata,
            dataType: this.DataType,
            success: function (data) {
                this.getdata = data;
                console.log("Get Success USER");
                console.log(data);
            },
            error: function (data, textStatus, errorThrown) {
                console.log(data);
            }
        })
    },
    ajaxSet: function (Type, dataType, url, postdata, getdata) {
        this.Type = Type;
        this.DataType = dataType;
        this.Url = url;
        this.postdata = postdata;
        this.getdata = getdata;
    }

};