# AbeCMS version 4.0.0

# Introduction

Here comes the version 4

## AbeCMS cli
## AbeCMS rest
## AbeCMS client

## Roadmap of the next 4.x releases

# Plan
- Un gestionnaire de projet "a la Trello" qui permet d'assigner à un membre / une équipe
- Vue calendrier
- Notifications insite et via mail

# Create
- ~~On peut créer des templates depuis des blocs~~
- ~~On peut générer plusieurs types de page à partir de la même data~~
- ~~Une data dans le json peut provenir d'un autre json (factorisation)~~
- ~~Compatible MongoDB !!!~~
- On peut abifier un html via un outil dédié
- Créer une vraie documentation "a la Gatsby"

## BUGS / Refactor
- ~~Retirer openCV du core~~
- ~~Retirer un max de dépendances du Core~~
- Essayer de rendre la synchro form / content dans l'éditeur dynamique (à la react) => cf abecms4research
- components oriented
- ~~It will be possible to create filtered views on the manager frontend~~
- since Abe has become stateful, clustering has been removed. Implement a solution to permit clusters of Abe
- add the date field
- ~~Add template creation from partials~~
- templates and partials will be uploadable
- Video training will be produced
- ~~Create an Electron version~~
- Refactor the REST layer: cf. https://github.com/Madmous/madClones/tree/develop/server/trello-microservice/src
- Usage of oAuth2 for REST routes
- Add robots.txt + URL redirection features in Abe
- ~~A JSON document could be associated with more than 1 template: AMP template, mobile, template, instant article template, desktop template...~~
- We must be able to chose a theme (composed by templates) from the admin
- We should be able to sync data, templates, ... from a distant Abe install
- Add a -d (--dev) option to Abe CLI so that we can have livereload and debug features during template dev
- ~~ Feature : Global variables #262 opened on 1 Nov 2017 by NRAUBER ~~
- For S3 use default credentials instead #256 opened on 27 Oct 2017 by baptistemanson
- 'abe-mailer' is not in the npm registry bug #254 opened on 23 Oct 2017 by vaughanwatson
- ~~ express-session memory leak #250 opened on 20 Oct 2017 by roccomuso  ~~
- abe-deployer-sftp #247 opened on 18 Oct 2017 by NRAUBER
- Special characters in password are not accepted bug #243 opened on 14 Oct 2017 by NRAUBER
- similar key between abe-each & abe-text bug #241 opened on 13 Oct 2017 by wonknu
- search engine like following will be awesome.. #232 opened on 14 Aug 2017 by jkathir
- The images doesn't move in the right item when I drag & drop bug #228 opened on 7 Aug 2017 by abderelmaftah
- ~~ activity stream on homepage is looping #219 opened on 29 May 2017 by opompilius ~~
- max length not working on rich tag #211 opened on 27 Apr 2017 by mehdidjabri
- symlink don't work when they are created with relative path bug #190 opened on 31 Mar 2017 by wonknu
- WYSIWYG editor color bug #186 opened on 30 Mar 2017 by julienlegac
- can't abe create name.io bug #183 opened on 28 Mar 2017 by gonzalezemmanuel
- Server refactoring enhancement refactoring #180 opened on 25 Mar 2017 by gregorybesson
- If I use an attribute "date" in a type=data, nothing does work anymore bug #127 opened on 30 Jan 2017 by gregorybesson  3.0.x
- Create a debug layer in Abe new feature #122 opened on 25 Jan 2017 by gregorybesson
- Functions in select data enhancement #120 opened on 24 Jan 2017 by GG31
- ~~ Partials included in severals templates with same values enhancement #119 opened on 19 Jan 2017 by GG31  3.0.x ~~
- {{#each}} - with limit enhancement #118 opened on 19 Jan 2017 by GG31  3.0.x
- {{#each}} - Title enhancement #36 opened on 21 Nov 2016 by julienlegac  3.0.x
- Allow select in json file new feature #109 opened on 5 Jan 2017 by catienza
- Plugin system enhancement #107 opened on 4 Jan 2017 by opompilius   1
- Browser does not scroll automatically to an editable zone in the preview bug #102 opened on 27 Dec 2016 by Roatha-Chann
- Republish site has no effect on prefill datas enhancement #86 opened on 15 Dec 2016 by opompilius
- ~~ Refactor : put users database in /database/users.json refactoring #73 opened on 8 Dec 2016 by gregorybesson ~~
- New feature : migrations new feature #71 opened on 8 Dec 2016 by gregorybesson
- Checkbox type new feature #64 opened on 2 Dec 2016 by GG31
- Create a new attribute in abe data type: macro=true new feature #54 opened on 29 Nov 2016 by opompilius
- We want shortcuts for draft / publish ... enhancement #8 opened on 18 Oct 2016 by gregorybesson  3.0.x

# Deploy
- On peut déployer sur n'importe quel site statique
- On peut déployer des micro-services (mail / form / moteur de recherche...)
- On peut communiquer avec des résumés sur Linkedin / Medium / Twitter et animer un contenu

# Measure
- On pose un tag Abe qui va mesurer un max d'infos
- On utilise GA pour récupérer un max d'infos sur le contenu
- On prend un max d'infos sur le contenu pendant les étapes de création
- On propose un dashboard complet de mesure


## Save data in external JSON
Comment sauvegarder un json dans un autre fichier ?
Depuis le template:
{{abe type="text" key="person.firstname" desc="prenom" tab="meta" source="/reference/person"}}

en faisant comme ça, je récupère d'un autre json, et j'écrase la data quand je save

si je veux juste lire :
```
{{abe key="person.firstname" source="/reference/person"}} => je lis de la source mais ne maj jamais
```
OU
```
{{abe type="data" key="person" source="/reference/person" editable="false" }}
{{person.firstname}}
```


# mongo
le serveur devrait être lancé depuis cli



# Migration 3 to 4
## hooks beforeCreate
change params
version 3 :
```
(
    'beforeCreate',
    json,
    postUrl,
    template
)
```

version 4 :
```
(
    'beforeCreate',
    template,
    postUrl,
    json
)
```

1. Terminer Mongo :
   1. Draft					              ======> OK
   2. workflow                        2H
   3. Publish				              ======> OK
   4. Unpublish                       2H
   5. Update				              ======> OK
   6. Duplicate				           ======> OK
   7. Tests unitaires                 12H
   8. Tests fonctionnels              0H
2. Vérifier File :
   1. Draft                           ======> OK
   2. workflow                        2H
   3. Publish                         ======> OK
   4. Unpublish                       2H
   5. Update                          ======> OK
   6. Duplicate                       ======> OK
   7. Tests unitaires                 ======> OK
   8. Tests fonctionnels              12H
3. Finaliser le look&feel admin       8H
4. User dans Mongo                    12H
5. API routes exposées proprement     24H
6. Upload de vidéo et transcodage     24H
7. API de vote par user / vidéo       12H
8. Mobile
   1. Création de compte              8H
   2. Authent / conservation du token 8H
   3. On Boarding                     8H
   4. Player vidéo lecture vidéos     12H
   5. Interactions du player vidéo    24H
   6. Formulaire en webview           8H
   7. Look & feel                     24H
9. Site web
   1. Création de compte
   2. Authent / conservation du token
   3. Player vidéo lecture vidéos
   4. Intercations du player vidéo
   5. Formulaire en iframe
   6. Look & feel

=> 204H = 25,5j
Il reste 15j

MINIMUM =>

"database": {
  "type": "mongo",
  "mongo": {
    "server": "mongodb://localhost",
    "port": "27017",
    "database": "abecms_dev"
  }
}