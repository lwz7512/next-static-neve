(function() {
  var banner = document.getElementById("bitnami-banner");
  var closeButton = document.getElementById("bitnami-close-banner-button");

  var toggleCloseButton = function toggleCloseButton(open) {
   if (closeButton){
      if(open && banner && banner.style.display != "none") {
        closeButton.style.display="block";
      } else {
        closeButton.style.display="none";
      }
   }
    return false;
  };
  var setCookie = function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  };

  var closeBanner = function closeBanner(open) {
    if (banner) {
      var suffix = banner.getAttribute('data-banner-id') || 'global';
      banner.style.display = "none";
      setCookie('_bitnami_closed_banner_' + suffix, "1", 30);
    }
    return false;
  }; 


  banner.onmouseover = function() { return toggleCloseButton(1); };
  banner.onmouseout = function() { return toggleCloseButton(0); }; 
  closeButton.onclick = closeBanner;
}());
