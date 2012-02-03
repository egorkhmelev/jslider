jQuery(document).ready(function(){
  
  window.prettyPrint && prettyPrint();

  jQuery("#Slider6").slider({ from: 1000, to: 100000, step: 500, smooth: true, round: 0, dimension: "&nbsp;$", skin: "plastic" });
});

function change_slider( node ){
  node = $(node);
  var value = $(node).val();
  if( value == "classic" ) value = null;
  jQuery("#Slider6").slider( "skin", value );
}