/*!
 * jQuery Edit Data
 * version: 1.0.0
 * @requires jQuery v1.7 or later
 * @Author Jinbo
 * Copyright (c) 2014
 */

/**
 * 使用方法
 <span id="a" data-url="数据提交url"></span>
 $("#a").editData({
  url: "",
  callback: function(data) { // 提交成功执行函数
  
  }
 });

  配置
  options = {
    "url": "",        // ajax 提交 url
    "data": {},       // ajax 提交时带的参数
    "name": "",       // ajax 提交时编辑框name字段
    "done": null,     // 提交成功回调
    "fail": null      // 提交返回失败回调
  };
 */
;(function($) {
  var _createEditInput,
    _getPosition;

  // 生成编辑框 html
  _createEditInput = function() {
    var html = "<div class='edit-input'><input type='text' value=''><a href='javascript:void(0)' class='edit-confirm'></a><a href='javascript:void(0)' class='edit-cancel'></a></div>";
    
    return $(html);
  };

  // 获取编辑框 left, top 值
  _getPosition = function(obj) {
    return {
      left: obj.offset().left - obj.offsetParent().offset().left,
      top: obj.offset().top - obj.offsetParent().offset().top
    };
  };

  $.fn.extend({
    editData: function(o) {
      // 监听点击事件，显示编辑框
      $(this).on("click", function() {  
        var $this = $(this),
          $editInput = _createEditInput(),  // 缓存生成编辑对象
          submitAjax,   // ajax对象
          hideInput,
          options,
          defaultVal = $this.attr("data-val") || $this.html();

        // 配置信息合并
        options = $.extend({
          url: $this.attr("data-url"),
          name: $this.attr("data-name")
        }, o);

        // 隐藏编辑框
        hideInput = function() {
          $(document).off("click.editData");
          $editInput.remove();
          $this.show();
        };

        // 添加全局点击监听事件, 取消编辑 setTimeout 防止点击时冒泡到document又隐藏了
        setTimeout(function() {
          $(document).on("click.editData", function() {
            hideInput();
          });
        }, 30);

        $this.after($editInput);
        $editInput.css(_getPosition($this)).on("click", function(e) {
          e.stopPropagation();
        })
          .find("input").val(defaultVal).focus().attr("lastValue", defaultVal)

          .end().find(".edit-confirm").on("click", function() { // 监听点击事件，向服务器提交数据
            var submitVal = $editInput.find("input").val();
            // 值未变或者已提交，则return
            if (submitVal == defaultVal) {
              hideInput();
              return;
            }
            
            if (submitAjax) submitAjax.abort();
            submitAjax = $.ajax({ // 缓存ajax对象
              url: options.url + "?" + options.name + "=" + submitVal,
              data: options.data
            }).done(function(data) {
              if (options.done) options.done.call($this[0], data);  // 执行回调函数
              submitAjax = null;
            }).fail(function(data) {

              if(options.fail) {
                options.fail($this[0], data);
              } else if (data) {
                alert(data);
              } else {
                alert("提交失败，请重新提交");
              }
              submitAjax = null;
            });
            hideInput();
          })

          .end().find(".edit-cancel").on("click", function() {  // 监听点击事件，取消编辑
            if (submitAjax) submitAjax.abort();   // 取消 ajax 请求
            hideInput();
          });
        $this.hide();
      });
    }
  });
})(jQuery);
