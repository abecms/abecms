problème du data dans les each

quand j'edite un doc, je passe le json, le template(text),  :

getDataList(text, jsonPage)
- Je cherche tous les tag avec type="data"
- je lance nextDataList(jsonPage, match[0]) pour chacun d'eux

    nextDataList(jsonPage, match[0])
    - je prends tous les attributs du tag Abe
    - je prends le type de source="" (request, url, file...)
    - Suivante le type, je maj jsonPage

        Pour une request

        requestList(obj, match, jsonPage)
        - Je lance la requete executeQuery(match, jsonPage)
        - Je recup la data obtenue que je mets dans jsonPage['abe_source'][obj.key] + dans jsonPage[obj.key]

- Je lance sur chacun nextSourceData(jsonPage, match)

    nextSourceData(jsonPage, match)
    - je prends tous les attributs du tag Abe
    - je rajoute les source=file en allant chercher les fichiers correspondants (===include)
