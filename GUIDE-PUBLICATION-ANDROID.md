# 📱 Guide de Publication Android - Google Play Store

## 🎯 Vue d'ensemble du processus

Publier une application Android sur Google Play Store nécessite plusieurs étapes :
1. **Préparation** de l'application
2. **Génération** d'un Android App Bundle (AAB)
3. **Configuration** dans Google Play Console
4. **Upload** et validation
5. **Publication** en production

## 📋 Prérequis

- ✅ Compte développeur Google Play (25$ USD, payé une seule fois)
- ✅ Android Studio installé
- ✅ Application Paceo configurée avec Capacitor
- ✅ Keystore de production (nous allons le créer)

## 🔧 Étape 1 : Préparation de l'application

### 1.1 Vérifier la configuration
```bash
# Vérifier que tout est à jour
npm run build
npx cap sync
```

### 1.2 Ouvrir le projet Android
```bash
npx cap open android
```

## 🔐 Étape 2 : Créer un Keystore de production

### 2.1 Créer le keystore
Dans Android Studio :
1. **Build** → **Generate Signed Bundle/APK**
2. Choisir **Android App Bundle (.aab)**
3. Cliquer **Create new...**

### 2.2 Configuration du keystore
Remplir les informations :
- **Key store path** : `C:\Users\VincentDEPEYRE\Documents\Dev\Paceo\Paceo\android\paceo-release-key.jks`
- **Password** : [Votre mot de passe fort]
- **Key alias** : `paceo-key`
- **Key password** : [Même mot de passe]
- **Validity** : 25 ans (recommandé)
- **Certificate** : Votre nom et organisation

### 2.3 Sauvegarder le keystore
⚠️ **IMPORTANT** : Sauvegardez le fichier `.jks` et le mot de passe en lieu sûr !

## 🏗️ Étape 3 : Configurer la signature

### 3.1 Créer le fichier de configuration
Créer `android/key.properties` :
```properties
storePassword=votre_mot_de_passe
keyPassword=votre_mot_de_passe
keyAlias=paceo-key
storeFile=../paceo-release-key.jks
```

### 3.2 Modifier build.gradle
Dans `android/app/build.gradle`, ajouter :
```gradle
// En haut du fichier
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... configuration existante ...
    
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## 📦 Étape 4 : Générer l'Android App Bundle

### 4.1 Build de production
Dans Android Studio :
1. **Build** → **Generate Signed Bundle/APK**
2. Choisir **Android App Bundle (.aab)**
3. Sélectionner le keystore créé
4. Choisir **release** build variant
5. Cliquer **Create**

### 4.2 Localisation du fichier
Le fichier `.aab` sera créé dans :
`android/app/build/outputs/bundle/release/app-release.aab`

## 🏪 Étape 5 : Configuration Google Play Console

### 5.1 Accéder à Google Play Console
1. Aller sur [Google Play Console](https://play.google.com/console)
2. Se connecter avec votre compte développeur

### 5.2 Créer une nouvelle application
1. Cliquer **Créer une application**
2. Remplir les informations :
   - **Nom de l'application** : `Paceo`
   - **Langue par défaut** : `Français (France)`
   - **Application ou jeu** : `Application`
   - **Gratuit ou payant** : `Gratuit`

## 📝 Étape 6 : Configuration des détails

### 6.1 Informations de l'application
- **Description courte** : "Convertisseur d'allure et vitesse pour coureurs"
- **Description complète** : 
```
Paceo est l'application parfaite pour les coureurs. Convertissez facilement entre allure et vitesse, calculez vos objectifs de course, et suivez vos progrès avec des outils professionnels.

Fonctionnalités :
• Convertisseur allure/vitesse en temps réel
• Calculateur d'objectifs de course
• Support des unités métriques et impériales
• Interface intuitive et moderne
• Retours haptiques élégants
• Fonctionne hors ligne

Idéal pour les coureurs de tous niveaux, du débutant au marathonien expérimenté.
```

### 6.2 Classification du contenu
- **Classification** : `Tous publics`
- **Publicité** : `Non`
- **Publicité ciblée** : `Non`

### 6.3 Captures d'écran
Prendre des captures d'écran de l'application :
- **Téléphone** : 1080 x 1920 pixels minimum
- **Tablette** : 1200 x 1920 pixels minimum
- Montrer les principales fonctionnalités

## 📤 Étape 7 : Upload de l'application

### 7.1 Aller dans Production
1. Dans Google Play Console, aller dans **Production**
2. Cliquer **Créer une nouvelle version**

### 7.2 Upload du fichier AAB
1. Cliquer **Choisir des fichiers**
2. Sélectionner `app-release.aab`
3. Attendre la fin de l'upload

### 7.3 Remplir les notes de version
```
Version 1.0.0 - Version initiale

Nouveautés :
• Convertisseur d'allure et vitesse en temps réel
• Calculateur d'objectifs de course
• Support des unités métriques et impériales
• Interface moderne avec retours haptiques
• Fonctionne entièrement hors ligne
• Optimisé pour tous les appareils Android
```

## 🔍 Étape 8 : Validation et publication

### 8.1 Vérifications pré-publication
- ✅ Informations de l'application complètes
- ✅ Captures d'écran ajoutées
- ✅ Icône de l'application
- ✅ Politique de confidentialité (si nécessaire)
- ✅ Classification du contenu

### 8.2 Soumettre pour révision
1. Cliquer **Soumettre pour révision**
2. Attendre la validation Google (24-48h généralement)

### 8.3 Publication
Une fois approuvée, l'application sera automatiquement publiée !

## 🚀 Commandes utiles

### Build et test
```bash
# Build de l'application
npm run build

# Sync avec Capacitor
npx cap sync

# Ouvrir Android Studio
npx cap open android

# Test sur émulateur
npx cap run android
```

### Vérifications
```bash
# Vérifier la configuration
npx cap doctor

# Vérifier les plugins
npx cap ls
```

## ⚠️ Points importants

### Sécurité
- **Ne jamais** partager votre keystore
- **Sauvegarder** le keystore et le mot de passe
- **Utiliser** le même keystore pour toutes les mises à jour

### Mises à jour futures
Pour les mises à jour :
1. Modifier le `versionCode` dans `build.gradle`
2. Modifier le `versionName`
3. Rebuild et uploader le nouveau AAB

### Problèmes courants
- **Upload échoue** : Vérifier la taille du fichier
- **Signature invalide** : Vérifier le keystore
- **Rejet Google** : Vérifier les guidelines

## 📊 Suivi post-publication

### Analytics
- Utiliser Google Play Console Analytics
- Surveiller les crashs et erreurs
- Analyser les commentaires utilisateurs

### Mises à jour
- Planifier les mises à jour régulières
- Répondre aux commentaires
- Surveiller les performances

## 🎉 Félicitations !

Votre application Paceo sera bientôt disponible sur Google Play Store ! 

**Temps estimé total** : 2-4 heures (première fois)
**Temps de validation Google** : 24-48h
**Coût** : 25$ USD (une seule fois)

Bonne chance avec votre publication ! 🚀📱
