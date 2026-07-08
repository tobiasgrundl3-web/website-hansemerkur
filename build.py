import re,os,glob
HEAD={'hund':('Unsicher, ob sich eine Absicherung für deinen Hund lohnt?','Kein Ratgeber ersetzt eine persönliche Einschätzung. Steven schaut sich deinen Fall kostenlos an und sagt dir ehrlich, was für deinen Hund sinnvoll ist.'),'katze':('Unsicher, ob sich eine Absicherung für deine Katze lohnt?','Kein Ratgeber ersetzt eine persönliche Einschätzung. Steven schaut sich deinen Fall kostenlos an und sagt dir ehrlich, was für deine Katze sinnvoll ist.'),'allgemein':('Unsicher, welche Tierversicherung wirklich zu dir passt?','Kein Ratgeber ersetzt eine persönliche Einschätzung. Steven schaut sich deinen Fall kostenlos an und sagt dir ehrlich, was sich lohnt, ohne Verkaufsdruck.')}
STOP=['häufige fragen','haeufige fragen','passende versicherung','fazit','bereit','wichtiger hinweis','checkliste','beispiel','das könnte','mehr ratgeber']
def tier_of(n):
    n=n.lower();h='hund' in n;k='katze' in n
    return 'hund' if h and not k else 'katze' if k and not h else 'allgemein'
def clean(t):
    t=re.sub(r'<[^>]+>','',t);t=t.replace('&auml;','ä').replace('&ouml;','ö').replace('&uuml;','ü').replace('&szlig;','ß').replace('&amp;','&')
    return re.sub(r'\s+',' ',t).strip().lower()
def form_block(tier):
    hl,sub=HEAD[tier];tv=tier if tier in('hund','katze') else ''
    return ('\n<section class="lf-wrap" aria-labelledby="lf-title">\n  <div class="lf-card">\n    <span class="lf-badge">✓ Persönliche Beratung · kostenlos &amp; unverbindlich</span>\n'+f'    <h2 class="lf-title" id="lf-title">{hl}</h2>\n    <p class="lf-sub">{sub}</p>\n'+'    <form class="lf-form" novalidate>\n      <div class="lf-row">\n        <div class="lf-field"><label>Vorname</label><input type="text" name="vorname" autocomplete="given-name" placeholder="Dein Vorname"></div>\n        <div class="lf-field"><label>E-Mail</label><input type="email" name="e_mail_adresse" autocomplete="email" placeholder="name@beispiel.de"></div>\n        <div class="lf-field"><label>Telefon (optional)</label><input type="tel" name="telefonnummer" autocomplete="tel" placeholder="Für schnelle Rückfragen"></div>\n      </div>\n      <p class="lf-err">Bitte gib deinen Vornamen und eine E-Mail oder Telefonnummer an.</p>\n'+f'      <input type="hidden" name="tierart" value="{tv}">\n'+'      <div class="lf-actions">\n        <button type="submit" class="lf-btn">Jetzt kostenlos beraten lassen</button>\n        <span class="lf-trust">Antwort meist am selben Tag · <strong>kein Verkaufsdruck</strong></span>\n      </div>\n      <div class="lf-person">\n        <img src="/ansprechpartner.png" alt="Steven Zupp, persönlicher Ansprechpartner" width="46" height="46">\n        <span><b>Steven Zupp</b>, dein persönlicher Ansprechpartner für die HanseMerkur Tierversicherung (§ 34d GewO).</span>\n      </div>\n    </form>\n  </div>\n</section>\n')
def add_mobile(h):
    return h if 'mobile-fixes.css' in h else h.replace('</head>','  <link rel="stylesheet" href="/mobile-fixes.css">\n</head>',1)
def integrate_form(path,html):
    if 'lf-form' in html: return html
    tier=tier_of(os.path.basename(path))
    h2s=[(m.start(),clean(m.group(1))) for m in re.finditer(r'<h2[^>]*>(.*?)</h2>',html,re.S)]
    content=[p for p in h2s if not any(s in p[1] for s in STOP)]
    pos=None
    if len(content)>=2: pos=content[2 if len(content)>=5 else 1][0]
    elif len(content)==1:
        aft=[p for p in h2s if p[0]>content[0][0]];pos=aft[0][0] if aft else None
    if pos is None:
        m=re.search(r'<h2[^>]*>\s*H&auml;ufige Fragen',html) or re.search(r'<section class="ctab"',html)
        pos=m.start() if m else None
    if pos is None: return html
    html=html[:pos]+form_block(tier)+html[pos:]
    if 'lead-inline.css' not in html: html=html.replace('</head>','  <link rel="stylesheet" href="/lead-inline.css">\n</head>',1)
    if 'lead-inline.js' not in html: html=html.replace('</body>','  <script src="/lead-inline.js" defer></script>\n</body>',1)
    return html
SKIP={'lp-hund/index.html','lp-katze/index.html','angebot-hund.html','angebot-katze.html','googledbcc9be0b8df178e.html'}
files=[f for f in glob.glob('*.html')+glob.glob('ratgeber/*.html') if f not in SKIP and not re.match(r'ratgeber-.*\.html$',os.path.basename(f))]
fd=md=0
for f in sorted(files):
    html=open(f,encoding='utf-8').read();orig=html
    if f.startswith('ratgeber/') and f!='ratgeber/index.html':
        new=integrate_form(f,html)
        if 'lf-form' in new and 'lf-form' not in html: fd+=1
        html=new
    b=html;html=add_mobile(html)
    if 'mobile-fixes.css' in html and 'mobile-fixes.css' not in b: md+=1
    if html!=orig: open(f,'w',encoding='utf-8').write(html)
print('forms',fd,'mobile',md)
