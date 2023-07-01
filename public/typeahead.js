"use strict";

(function( $ ) {
    $(function() {
        $( "#q" ).bootcomplete({
          url: "/search",
          method: "post"
        });

    });
})( jQuery );