# DIEUDONNE MUSIC / DIEUDONNE EDITOR PRO

Uyu ni umushinga wa website igenewe telefoni na mudasobwa.

## Ibirimo
- Urupapuro rw'ibanze rufite design ijyanye n'umuziki.
- Indirimbo: gushakisha, kumva no gukuramo.
- Video: kureba no gukuramo.
- Login na signup ukoresheje Supabase Auth.
- Admin: gushyiraho audio/video n'igifuniko.
- Contact form itegura ubutumwa kuri WhatsApp.
- Responsive design ya telefoni.

## Icyitonderwa
Website iri muri iyi package ntiyaba iri kuri internet kugeza uyishyize kuri hosting. Konti, kubika media no kuyishyiraho bisaba Supabase. Nta passwords cyangwa secret keys byashyizwemo.

## 1. Gutegura Supabase
1. Fungura https://supabase.com/ ukoreshe konti yawe.
2. Kora project nshya.
3. Fungura SQL Editor, wandikemo ibiri muri `supabase.sql`, ukande Run.
4. Jya kuri Storage, ukore buckets ebyiri: `media` na `covers`.
5. Reba policies za Storage muri `supabase.sql`; ntukemere ko buri wese ashyiraho files.
6. Muri Project Settings > API, kopora Project URL na anon/publishable key.
7. Kora kopi ya `config.example.js`, uyite `config.js`, ushyiremo URL na anon/publishable key.
8. Nyuma yo kwiyandikisha kuri website, shaka UUID ya konti muri Authentication > Users. Koresha SQL comment iri muri `supabase.sql` kugira ngo uyigire admin. Ntugire abandi admin utabizi.

**Ntushyire muri `config.js` service_role key cyangwa database password.** Public anon/publishable key ikoreshwa na browser, ariko umutekano ushingira kuri RLS policies.

## 2. Gutangaza website ku buntu
### Vercel (byoroshye iyo ukoresha GitHub)
1. Shyira amafayili yose muri repository ya GitHub.
2. Fungura https://vercel.com/ winjire ukoresheje GitHub.
3. Kanda Add New > Project, uhitemo repository.
4. Kuri iyi static project, nta build command ikenewe; Output Directory ibe `.` niba ibajijwe.
5. Kanda Deploy. URL izagaragara Vercel imaze kurangiza. URL ntishobora kumenyekana mbere y'uko deployment irangira.

### GitHub Pages
1. Shyira files muri root ya repository.
2. Kuri GitHub, fungura repository > Settings > Pages.
3. Hitamo Deploy from a branch, branch `main`, folder `/ (root)`, ukande Save.
4. GitHub izerekana URL yayo mu gice cya Pages.

## 3. Kugerageza
- Fungura `index.html` kuri hosting yawe.
- Niba Supabase itarashyirwaho, urubuga rugaragaza demo mode.
- Niba konti zitinjira, genzura `config.js`, Supabase Auth settings, na URL.
- Niba upload yanze, genzura ko konti yawe ifite role `admin`, Storage buckets zihari, na policies zemewe.
- Audio/video files zigaragara ku mugaragaro niba buckets ari public; shyiraho gusa ibihangano ufitiye uburenganzira bwo gusangiza abandi.

## 4. Ibyo uyu mushinga utarimo
- Ntabwo ari video editor yuzuye ikorera muri browser; aha ni portfolio yo kwerekana video editing services n'ibikorwa.
- Nta kwishyura online cyangwa mobile-money automation byashyizwemo.
- Nta URL y'ukuri ishobora gutangwa mbere yo kuyitangaza kuri hosting.
