(function(){
  var WEBHOOK='https://hooks.zapier.com/hooks/catch/26752793/unc3vyb/';
  var UTM=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid'];
  function param(k){try{return new URLSearchParams(location.search).get(k)||localStorage.getItem(k)||'';}catch(e){return '';}}
  document.querySelectorAll('.lf-form').forEach(function(form){
    var card=form.closest('.lf-card');
    var intro=card?card.querySelector('.lf-intro'):null;
    var steps=[].slice.call(form.querySelectorAll('.lf-step'));
    var fill=form.querySelector('.lf-progress__fill');
    var answers={};var cur=0;
    function show(i){cur=i;steps.forEach(function(s,idx){s.classList.toggle('is-active',idx===i);});if(fill)fill.style.width=((i+1)/steps.length*100)+'%';if(intro)intro.style.display=(i===0?'':'none');}
    form.querySelectorAll('.lf-options').forEach(function(group){
      var field=group.getAttribute('data-field');
      group.querySelectorAll('.lf-opt').forEach(function(btn){
        btn.addEventListener('click',function(){
          group.querySelectorAll('.lf-opt').forEach(function(b){b.classList.remove('is-sel');});
          btn.classList.add('is-sel');answers[field]=btn.getAttribute('data-value');
          setTimeout(function(){if(cur<steps.length-1)show(cur+1);},260);
        });
      });
    });
    form.querySelectorAll('.lf-back').forEach(function(b){b.addEventListener('click',function(){if(cur>0)show(cur-1);});});
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var vn=(form.querySelector('[name=vorname]')||{}).value||'';vn=vn.trim();
      var tel=(form.querySelector('[name=telefonnummer]')||{}).value||'';tel=tel.trim();
      var em=(form.querySelector('[name=e_mail_adresse]')||{}).value||'';em=em.trim();
      var err=form.querySelector('.lf-err');
      if(!vn||tel.replace(/[^0-9]/g,'').length<6){if(err)err.classList.add('is-on');return;}
      if(err)err.classList.remove('is-on');
      var btn=form.querySelector('.lf-btn');if(btn){btn.disabled=true;btn.textContent='Wird gesendet …';}
      var page=location.pathname.split('/').pop()||'';var tier=answers.tierart||'';
      var data={vorname:vn,telefonnummer:tel,e_mail_adresse:em,tierart:tier,alter:answers.alter||'',versicherung:answers.versicherung||'',
        formular:(tier==='katze'?'Katze':tier==='hund'?'Hund':'Ratgeber'),tier:(tier==='katze'?'Katze':tier==='hund'?'Hund':''),
        lead_source:'ratgeber',seite:page,zeitstempel:new Date().toISOString()};
      UTM.forEach(function(k){data[k]=param(k);});
      var body=new URLSearchParams(data).toString();
      try{if(navigator.sendBeacon){navigator.sendBeacon(WEBHOOK,new Blob([body],{type:'application/x-www-form-urlencoded'}));}else{fetch(WEBHOOK,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body,keepalive:true});}}catch(e){}
      var q=UTM.map(function(k){return{k:k,v:data[k]};}).filter(function(o){return o.v;}).map(function(o){return o.k+'='+encodeURIComponent(o.v);}).join('&');
      location.href=q?'/danke.html?'+q:'/danke.html';
    });
    show(0);
  });
})();
