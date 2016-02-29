(function(){

  $.scrollify({
    section : ".screen",
    sectionName : "name",
    easing: "easeOutExpo",
    // scrollSpeed: 1100,
    offset : 0,
    scrollbars: true,
    standardScrollElements: "",
    before:function() {},
    after:function(e) {
        if(e == "9") {

        }
    },
    afterResize:function() {},
    afterRender:function() {}
  });

  // window.sr = ScrollReveal();

    var revealOptions = {
      delay    : 200,
      distance : '90px',
      reset    : true,
      easing   : 'ease-in-out',
      // rotate   : { z: 10 },
      scale    : 1.1
    };

    var h1Options = {
      delay    : 0,
      distance : '90px',
      reset    : true,
      easing   : 'ease-in-out',
      scale    : 1.1
    }

    var liOptions = {
      delay    : 100,
      distance : '90px',
      reset    : true,
      easing   : 'ease-in-out',
      scale    : 1.1
    }

    // sr.reveal('.requirement', revealOptions);
    // sr.reveal('h1', h1Options);
    // sr.reveal('li', liOptions);
    // sr.reveal('p', liOptions);


})();
