(function(){
  var WEBHOOK='https://hooks.zapier.com/hooks/catch/26752793/unc3vyb/';
  var UTM=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid'];
  function param(k){try{return new URLSearchParams(location.search).get(k)||localStorage.getItem(k)||'';}catch(e){return '';}}
  document.querySelectorAll('.lf-form').forEach(function(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var vn=(form.querySelector('[name=vorname]')||{}).value||'';vn=vn.trim();
      var em=(form.querySelector('[name=e_mail_adresse]')||{}).value||'';em=em.trim();
      var tel=(form.querySelector('[name=telefonnummer]')||{}).value||'';tel=tel.trim();
      var err=form.querySelector('.lf-err');
      if(!vn||(!em&&!tel)){if(err)err.classList.add('is-on');return;}
      if(err)err.classList.remove('is-on');
      var btn=form.querySelector('.lf-btn');if(btn){btn.disabled=true;btn.textContent='Wird gesendet …';}
      var page=location.pathname.split('/').pop()||'';
      var tier=(form.querySelector('[name=tierart]')||{}).value||'';
      var data={vorname:vn,e_mail_adresse:em,telefonnummer:tel,tierart:tier,
        formular:(tier==='katze'?'Katze':tier==='hund'?'Hund':'Ratgeber'),
        tier:(tier==='katze'?'Katze':tier==='hund'?'Hund':''),
        lead_source:'ratgeber',seite:page,zeitstempel:new Date().toISOString()};
      UTM.forEach(function(k){data[k]=param(k);});
      var body=new URLSearchParams(data).toString();
      try{if(navigator.sendBeacon){navigator.sendBeacon(WEBHOOK,new Blob([body],{type:'application/x-www-form-urlencoded'}));}
        else{fetch(WEBHOOK,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body,keepalive:true});}}catch(e){}
      var q=UTM.map(function(k){return{k:k,v:data[k]};}).filter(function(o){return o.v;}).map(function(o){return o.k+'='+encodeURIComponent(o.v);}).join('&');
      location.href=q?'/danke.html?'+q:'/danke.html';
    });
  });
})();
