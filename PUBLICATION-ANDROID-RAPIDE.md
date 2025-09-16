# 🚀 Publication Android - Guide Rapide

## ⚡ Étapes Essentielles

### 1. **Préparation** (5 min)
```bash
# Build de l'application
npm run build
npx cap sync
```

### 2. **Créer le Keystore** (10 min)
1. Ouvrir Android Studio : `npx cap open android`
2. **Build** → **Generate Signed Bundle/APK**
3. **Android App Bundle (.aab)** → **Create new...**
4. Remplir les informations du keystore
5. **Sauvegarder** le fichier `.jks` et le mot de passe !

### 3. **Configurer la signature** (5 min)
1. Créer `android/key.properties` :
```properties
storePassword=votre_mot_de_passe
keyPassword=votre_mot_de_passe
keyAlias=paceo-key
storeFile=../paceo-release-key.jks
```

2. Modifier `android/app/build.gradle` (voir GUIDE-PUBLICATION-ANDROID.md)

### 4. **Générer l'AAB** (5 min)
1. **Build** → **Generate Signed Bundle/APK**
2. Sélectionner le keystore créé
3. **release** build variant
4. **Create**

### 5. **Google Play Console** (30 min)
1. Aller sur [Google Play Console](https://play.google.com/console)
2. **Créer une application**
3. Remplir les informations :
   - Nom : `Paceo`
   - Description : "Convertisseur d'allure et vitesse pour coureurs"
   - Gratuit
4. **Production** → **Créer une nouvelle version**
5. Uploader le fichier `.aab`
6. Remplir les notes de version
7. **Soumettre pour révision**

## 📁 Fichiers Importants

- **AAB généré** : `android/app/build/outputs/bundle/release/app-release.aab`
- **Keystore** : `android/paceo-release-key.jks`
- **Configuration** : `android/key.properties`

## ⚠️ Points Critiques

1. **Sauvegarder le keystore** - Sans lui, impossible de mettre à jour l'app !
2. **Même keystore** pour toutes les mises à jour
3. **Version code** différent à chaque mise à jour
4. **Captures d'écran** obligatoires

## 🎯 Temps Total

- **Première fois** : 1-2 heures
- **Mises à jour** : 30 minutes
- **Validation Google** : 24-48h

## 🆘 En cas de problème

- **Upload échoue** : Vérifier la taille du fichier
- **Signature invalide** : Vérifier le keystore
- **Rejet Google** : Vérifier les guidelines

## 📞 Support

- Guide détaillé : `GUIDE-PUBLICATION-ANDROID.md`
- Documentation Capacitor : https://capacitorjs.com/docs
- Google Play Console Help : https://support.google.com/googleplay/android-developer

**Bonne chance ! 🚀📱**
