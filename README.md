# Module Web Scraping

Module animé par Says BEJAOUI et réalisé à l'école IPSSI.

```bash
npm i
npm start
```

## Table des matières

* [Installation]()
* [Analyse]()
  * [Erreurs et comparaison]()
  * [Fusion]()

## Installation

**Pré-requis :** NodeJS v16.8.0

```bash
npm i
npm start
```


## Analyse

### Erreurs et comparaison

Dans le but de traiter les données récupérées du site planecrashinfo et de les comparer avec les données du site d'aviation-safety, il est nécessaire de savoir si les fichier comportent des erreurs. 

Dans un premier temps, un tableau catégorisant par attribut (par exemple, les fatalités ou le nom des avions) sera fait, la fréquence où celui-ci a été présent dans une page. Pour faciliter les futurs calculs, deux fréquences (en pourcentage) seront enregistrées : la fréquence où l'attribut a été utilisé (n), et avant la prise en compte de l'attribut (n-1). Cela nous permettra de savoir si les pages ont bien les mêmes attributs. 

Dans un second temps, on cherchera à comparer l'ensemble des enregistrements de planecrashinfo à celui d'aviation-safety à travers deux tableaux misent côte à côte. 

Dans un dernier temps, on cherchera à faire certaines statistiques sur les crashs récoltées entre les deux sites.


### Fusion

*A faire*