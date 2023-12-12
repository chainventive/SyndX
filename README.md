# SyndX

![image](https://github.com/chainventive/SyndX/assets/145052675/8c8193d5-e7bc-4c24-8e87-b9c7112e2e53)

[ISO: SYN10]

SyndX propose une large palette de services dédiés aux syndics de copropriété, aussi bien professionnels que bénévoles. SyndX permet de simplifier la gestion de syndic et de réduire ses coûts d'infrastructure en automatisant les différentes étapes de leur processus tout en respectant leurs obligations règlementaires. En apportant une transparence dans la gestion de syndic, SyndX apporte un avantage majeur aux syndics que tous les clients. Tout bon propriétaire cherchera à travailler avec un syndic "labellisé" SYNDX !

## Démo Vidéo

coming soon ...

## Déploiement:

La dapp est accessible ici -> http://193.70.112.124:3000/

* Pour pouvoir pleinement tester la dApp, me MP afin que je crée un jeu de données de test associé a votre address ETH
* Le déploiement est réalisé à l'aide d'un pipeline Azure Devops [azure-pipelines-dapp.yml](https://github.com/chainventive/SyndX/blob/bf29578bed4d19371738cfe06bca58a2115568da/azure-pipelines-dapp.yml)
* La dApp est hébergée sur un serveur OVH équipé de Ubuntu et Docker [Dockerfile](https://github.com/chainventive/SyndX/blob/bf29578bed4d19371738cfe06bca58a2115568da/dapp/frontend/Dockerfile)

## Généralités:

### Il existe 3 types de d'utilisateurs avec des droits d'accès propres: 

- l'entité syndx (le deployer de la solution);
- syndic (représente le syndic d'une copropriété donnée);
- property owner (représente un propriétaire au sein d'une copropriété);

L'utilisateur 'Syndx': Il ne peut pas s'ingérer dans la gestion des copropriétés (à moins d'en être le syndic). En dehors de la possibilité de créer une copropriété, son rôle se cantonne essentiellement à la maintenance du système.

L'utilisateur 'Syndic': Ses droits se limitent à la gestion administrative d'une copropriété (gérer la liste des copropriétaires, définir leur tantièmes, créer des assemblées générales, définir les types de scrutins de chaque résolutions, proposer des résolutions et des amendements ou encore demander un départage des égalités). En revanche, il ne peux pas voter, influer sur la timeline d'une assemblée générale ou modifier le résultat des actions des propriétatires pour servir ces intérêts.

L'utilisateur 'Property Owner' ou 'Owner': Il peux participer aux assemblées générales, soumettre des résolutions, des amendements et voter. Il peut également initier une demande pour départager les égalitées et déléguer ses droits de votes à d'autres propriétaires.

### Un mot sur les contrats:

Le contrat Syndx.sol est le point d'entrée du système. Il permet de tenir un registre des copropriétés et de déployer les contrats nécessaires à leur gouvernance. Pour cela il s'appuie sur le contrat Coproperty.sol et TokenFactory.sol.
Syndx.sol se base également sur SyndxVRF.sol pour fournir un service de départage des égalitées de vote grâce à un oracle Chainlink VRF. 

Les logiques de Syndx et de SyndxVRF ont été séparée dans un souçi de compartimenter des fonctionnalitées différentes. Syndx est une factory tandis que SyndxVRF se charge de communiquer avec Chainlink. En revanche, les logiques de factory Syndx et TokenFactory ont été séparées compte tenu des limitations en termes de taille de bytecode.

GovernanceToken.sol est le token qui permet de représenter les tantièmes des différents propriétaire d'une copropriété. C'est le syndic de la copropriété qui gère leur distribution se la base des documents légaux forunis par les propriétaires.

VoteToken.sol est un token qui représente une part de vote (1 vote token = 1 tantieme). A chaque assemblée générale, un contrat VoteToken.sol est déployé. Les propriétaires peuvent alors 'claims' leur tokens de vote à raison de 1 vote token = 1 governance token. En revanche, il peuvent se transférer ces tokens entre eux (uniquement) pour se déléguer du pouvoir de vote, jusqu'à la période de lockup qui précède la session de vote.

Coproperty.sol est la représentation d'une copropriété et permet au syndic de déployer des assemblées générales.

Assembly.sol représente une assemblée générale d'une copropriété. Ce contrat gère la collecte des résolutions et des amendements des propriétaires ou du syndic. Il permet également de receuillir les votes et d'afficher les résultats selon le mode de scrutin définis. Par ailleurs, il permet d'initier la demande départage des égalités via un oracle Chainlink VRF. Si Syndx.sol sert de relayer à cette demande (pour simplifier la communication avec chainlink), c'est bien Assembly.sol qui reçoit et stocke le nombre aléatoire.

Pour départager les égalités, on vérifie simplement si le nombre aléatoire fourni par Chainlink est pair ou impair.

### Précisions sur l'implémentation de Chainlink VRF :

Si une requête chainlink VRF n'aboutie pas, elle peut être relancée par Syndx après une certaine période de grâce mesurée en quantité de blocs (constants.sol). Une fois le nombre aléatoire chainlink reçue, il est figé dans le contrat de l'assemblée générale et aucune nouvelle requête ne peux être lancé.

Lorsque le contrat Syndx.sol est déployé, il est automatiquement ajouté comme consommateur dans le contrat VRFCoordinatorV2 (ou VRFCoordinatorV2Mock) de Chainlink selon que l'on déploie en testnet ou en local.

### Précisions sur le script de déploiement:

En plus de déployer les contrats de base Syndx.sol, TokenFactory.sol et d'appairer Syndx.sol avec le compte chainlink VRF, ce script génère un fichier "deployOutput.js" dans le répertoire source du frontend. Cela permet d'automatiser la mise a jour des addresses des contrats que la dApp utilise ainsi que leur ABIs. En plus d'être pratique en mode dev, cela simplifie aussi le fonctionnement du pipeline de déploiement.

## Tests Unitaires

  145 passing (5s)

------------------------------|----------|----------|----------|----------|----------------|
File                          |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
------------------------------|----------|----------|----------|----------|----------------|
 contracts/                   |      100 |    84.38 |      100 |      100 |                |
  ISyndx.sol                  |      100 |      100 |      100 |      100 |                |
  Syndx.sol                   |      100 |    84.38 |      100 |      100 |                |
 contracts/_common/           |      100 |      100 |      100 |      100 |                |
  SDX.sol                     |      100 |      100 |      100 |      100 |                |
  constants.sol               |      100 |      100 |      100 |      100 |                |
 contracts/_common/errors/    |      100 |      100 |      100 |      100 |                |
  ValidatorErrors.sol         |      100 |      100 |      100 |      100 |                |
  addresses.sol               |      100 |      100 |      100 |      100 |                |
  coproperty.sol              |      100 |      100 |      100 |      100 |                |
  syndx.sol                   |      100 |      100 |      100 |      100 |                |
  syndxVRF.sol                |      100 |      100 |      100 |      100 |                |
  tokenFactory.sol            |      100 |      100 |      100 |      100 |                |
 contracts/assembly/          |      100 |       90 |      100 |      100 |                |
  GeneralAssembly.sol         |      100 |       90 |      100 |      100 |                |
  IGeneralAssembly.sol        |      100 |      100 |      100 |      100 |                |
 contracts/coproperty/        |      100 |    66.67 |      100 |      100 |                |
  Coproperty.sol              |      100 |    66.67 |      100 |      100 |                |
  ICoproperty.sol             |      100 |      100 |      100 |      100 |                |
 contracts/randomness/        |      100 |       50 |      100 |      100 |                |
  SyndxVRF.sol                |      100 |       50 |      100 |      100 |                |
  VRFCoordinatorV2.sol        |      100 |      100 |      100 |      100 |                |
  VRFCoordinatorV2Mock.sol    |      100 |      100 |      100 |      100 |                |
 contracts/tokens/            |      100 |      100 |      100 |      100 |                |
  ITokenFactory.sol           |      100 |      100 |      100 |      100 |                |
  TokenFactory.sol            |      100 |      100 |      100 |      100 |                |
 contracts/tokens/governance/ |      100 |    88.46 |      100 |      100 |                |
  GovernanceToken.sol         |      100 |    88.46 |      100 |      100 |                |
  IGovernanceToken.sol        |      100 |      100 |      100 |      100 |                |
 contracts/tokens/vote/       |      100 |    88.89 |      100 |      100 |                |
  IVoteToken.sol              |      100 |      100 |      100 |      100 |                |
  VoteToken.sol               |      100 |    88.89 |      100 |      100 |                |
------------------------------|----------|----------|----------|----------|----------------|
All files                     |      100 |     87.5 |      100 |      100 |                |
------------------------------|----------|----------|----------|----------|----------------|

## Backend

- HardHat
- OpenZeppelin
- ERC20
- Chainlink VRF
- Chainlink VRF Mock

## Frontend

- RainbowKit
- Wagmi
- Viem
- ChakraUI
- NextJS

## VCS

- Git / Github

## CI/CD

- Azure Devops
- Docker
- VPS OVH Ubuntu

## Aperçus

![SyndxHome](https://github.com/chainventive/SyndX/assets/145052675/59d0b697-e252-4b15-8ab9-3de314222fa3)

![SyndxAssembly](https://github.com/chainventive/SyndX/assets/145052675/70a6897b-4800-459e-bb90-df671d9d2699)




