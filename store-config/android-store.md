# Configuration Android Store (Google Play)

## Informations de l'application
- **Nom de l'application**: Paceo
- **Package ID**: com.aenean.paceo
- **Version**: 1.0.0
- **Description**: Paceo – Convertisseur d'allure et vitesse, calculateur d'objectifs course.

## Étapes pour publier sur Google Play

### 1. Préparation
1. Créer un compte développeur Google Play Console
2. Payer les frais d'inscription (25$ USD, une seule fois)

### 2. Configuration de l'application
1. Aller dans Google Play Console
2. Créer une nouvelle application
3. Remplir les informations :
   - Nom de l'application: Paceo
   - Langue par défaut: Français
   - Application ou jeu: Application
   - Gratuit ou payant: Gratuit

### 3. Configuration des stores
1. **Détails de l'application**:
   - Description courte: "Convertisseur d'allure et vitesse pour coureurs"
   - Description complète: "Paceo est l'application parfaite pour les coureurs. Convertissez facilement entre allure et vitesse, calculez vos objectifs de course, et suivez vos progrès avec des outils professionnels."
   - Icône: Utiliser l'icône Paceo (1024x1024px)
   - Captures d'écran: Prendre des captures de l'application en fonctionnement

2. **Contenu de l'application**:
   - Classification du contenu: Tous publics
   - Publicité: Non
   - Publicité ciblée: Non

3. **Prix et distribution**:
   - Gratuit
   - Pays/territoires: Tous les pays

### 4. Génération de l'APK/AAB
```bash
# Construire l'application
npm run build

# Synchroniser avec Capacitor
npx cap sync

# Ouvrir Android Studio
npx cap open android
```

Dans Android Studio:
1. Build > Generate Signed Bundle/APK
2. Choisir Android App Bundle (.aab)
3. Créer un nouveau keystore
4. Générer le fichier .aab

### 5. Upload sur Google Play
1. Aller dans "Production" > "Créer une nouvelle version"
2. Uploader le fichier .aab
3. Remplir les notes de version
4. Soumettre pour révision

## Permissions requises
- INTERNET (pour les fonctionnalités en ligne)

## Configuration de sécurité
- L'application utilise HTTPS pour toutes les communications
- Aucune donnée personnelle sensible n'est stockée
- Conformité RGPD incluse
