// ==UserScript==
// @name        6park
// @namespace   sisy
// @include     http://m.6park.com/＊
// @version     1
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require     http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js
// @require     http://cdnjs.cloudflare.com/ajax/libs/jQuery-slimScroll/1.3.3/jquery.slimscroll.min.js
// @require     http://cdnjs.cloudflare.com/ajax/libs/jasny-bootstrap/3.1.3/js/jasny-bootstrap.min.js
// @require     http://cdnjs.cloudflare.com/ajax/libs/autosize.js/1.18.18/jquery.autosize.min.js
// @require     http://cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment-with-locales.min.js
// @resource    cssBootstrap http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css
// @resource    cssJasny http://cdnjs.cloudflare.com/ajax/libs/jasny-bootstrap/3.1.3/css/jasny-bootstrap.min.css
// @resource    tmplr  https://raw.githubusercontent.com/cyveros/hexpark/master/layout.html
// @grant       GM_getResourceText
// @grant       GM_addStyle
// ==/UserScript==

// bootstrap

$(function(){
  var L = new Loader();
  L.
   css(['cssBootstrap', 'cssJasny']).
   style('@media (min-width: 992px) {body {padding-left: 300px;padding-right:300px;}} .col-sm-12 {padding5px;}').
   style('@media (min-width: 992px) {.navbar-fixed-top {padding-left: 300px;padding-right:300px;z-index:1020;background-color:#0073c6;}}').
   style('.navbar-brand {padding:9px;} #article {padding-top:50px;}');

  var list = getFeeds();
//   var title = getTitle();
//   var siteMap = getSiteMap();
//   var nav = getNav();

  L.tmpl('tmplr');
  $('body').html(L.T('tmplr'));
  
  list.forEach(function(news){
    var html = '<li class="list-group-item"><a class="list-group-item-heading" data-href="' + news.href + '">' + news.title + '</a><p class="list-group-item-text">' + news.desc + '</p></li>';
    if (news.featured) {
      $('#featured').append(html);
    } else {
      $('#regular').append(html);
    }
    
  });
  
  $('.scrollPane').slimScroll({
    height: '100%'
  });
  
  $('.list-group-item-heading').click(function(){
//     $('#article').load($(this).attr('data-href') + ' .finCnt', function(data){
//       console.log(data);
      
//     });
    $.ajax({
      url: $(this).attr('data-href'), 
      method: 'GET'
    }).done(function(data){
      $('.cnt').remove();
      $('#comments').html('');
      
      var html = $(data);
      $('#article').append(html.find('.cnt'));
      
      var title = html.find('h1').text();
      
      $('#article .page-header h1').text(title);
      
      var source = html.find('.info').contents().get(0);
      $('#article .page-header p').html(source);
      
      var comments = [];
      var its = html.find('.it');
      
      its.each(function(){
        var user = $(this).find('.maj');
        var message = $(this).find('.ugc');
        
        if (user.length > 0) {
          var post = {};
          
          var timestamp = user.find('em').text();
          moment.lang('zh-CN');
          var time = moment(timestamp).fromNow();
          post.floor = $.trim(user.contents().get(0).nodeValue);
          post.author = user.find('a').text();
          post.message = $.trim(message.text());
          post.time = time;
          
          comments.push(post);
        } 
      });
      comments.forEach(function(comment){
        $('#comments').append('<li class="list-group-item"><span class="badge">' + comment.floor + '</span><h5 class="list-group-item-heading">' + comment.message + '</h5><p class="list-group-item-text text-muted">' + comment.author + ' <small>' + comment.time + '</small></p></li>');
      });
      
      $('#comments').prepend('<li class="list-group-item"><form class="form-inline" role="form"><div class="input-group"><input class="form-control" rows="1" name="r_content"/><span class="input-group-btn"><button type="button" class="btn btn-primary">Post</button></span></div></form></li>');
      
    });
  });
  
  autosize($('textarea'));
});

function Loader() {
  var _this = this;
  
  _this.templates = {};
  
  _this.css = _css;
  _this.style = _style;
  _this.tmpl = _tmpl;
  _this.T = _T;
  
  function _css(resource) {
    _load(resource, function(target){
      GM_addStyle(GM_getResourceText(target));
    });
    
    return _this;
  }
  
  function _style(resource) {
    GM_addStyle(resource);
    
    return _this;
  }
  
  function _tmpl(resource) {
    _load(resource, function(target){
      _this.templates[target] = GM_getResourceText(target);
    });
    
    return _this;
  }
  
  function _T(tmpl) {
    return _this.templates[tmpl];
  }
  
  function _load(resource, process) {
    if (typeof resource === 'string') {
      process(resource);
      return;
    }
    
    resource.forEach(function(target){
      process(target);
    });
  }
}

function getFeeds() {
  var feeds = [];
  
  $('.it').each(function(){
    var news = {};
    var a = $(this).find('a');
    
    news.featured = $(this).hasClass('good');
    news.href = a.prop('href');
    
    news.desc = $.trim(a.find('.tt_reads, span').text());
    a.find('.tt_reads, span').remove();
    
    news.title = $.trim(a.find('.ttl').text());
    
    feeds.push(news);
  });
  
  return feeds;
}

// function getTitle() {
//   return $('.cTtl').text();
// }

// function getSiteMap() {
//   return $('.reHome').text();
// }

// function getNav() {
//   var nav = {};
  
//   var pageCtrl = $('.showMore a');
  
//   nav.home = pageCtrl.eq(0).prop('href');
//   nav.prev = pageCtrl.eq(1).prop('href');
//   nav.next = pageCtrl.eq(2).prop('href');
  
//   return nav;
// }

// $(function(){
//   alert($('.it').length);
//   $('.it').each(function){
//     var news = {};
//     var a = $(this).find('a');
//     news.href = a.prop('href');
//     news.title = a.contents().get(0).nodeValue;
//     news.count = a.find('.tt_reads').text();
//     alert(JSON.stringify(news));
//     feeds[] = news;
//   };
  
//   alert(feeds);
// });
