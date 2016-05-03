function animate(id){
  var animationName = 'animated pulse';
  var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
  $( id ).addClass(animationName).one(animationEnd, function(){
    $(id).removeClass(animationName);
  });
}

$( "#btn1" ).mouseover(function() {
   animate("#btn1");
});

$( "#btn2" ).mouseover(function() {
   animate("#btn2");
});

$( "#btn3" ).mouseover(function() {
   animate("#btn3");
});