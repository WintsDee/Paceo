# Configuration iOS Store (App Store)

## Informations de l'application
- **Nom de l'application**: Paceo
- **Bundle ID**: com.aenean.paceo
- **Version**: 1.0.0
- **Description**: Paceo – Convertisseur d'allure et vitesse, calculateur d'objectifs course.

## Étapes pour publier sur l'App Store

### 1. Préparation
1. Créer un compte développeur Apple (99$/an)
2. Installer Xcode sur macOS
3. Configurer les certificats de développement

### 2. Configuration de l'application
1. Aller dans App Store Connect
2. Créer une nouvelle application
3. Remplir les informations :
   - Nom de l'application: Paceo
   - Langue principale: Français
   - Bundle ID: com.aenean.paceo
   - SKU: com.aenean.paceo

### 3. Configuration des stores
1. **Informations de l'application**:
   - Description: "Paceo est l'application parfaite pour les coureurs. Convertissez facilement entre allure et vitesse, calculez vos objectifs de course, et suivez vos progrès avec des outils professionnels."
   - Mots-clés: course, running, allure, vitesse, calculateur, objectifs
   - Support: URL de support (à configurer)
   - URL marketing: URL du site web (à configurer)

2. **Captures d'écran**:
   - iPhone 6.7": 1290 x 2796 pixels
   - iPhone 6.5": 1242 x 2688 pixels
   - iPhone 5.5": 1242 x 2208 pixels
   - iPad Pro 12.9": 2048 x 2732 pixels

3. **Classification**:
   - Classification du contenu: 4+
   - Publicité: Non

### 4. Génération de l'IPA
```bash
# Construire l'application
npm run build

# Synchroniser avec Capacitor
npx cap sync

# Ouvrir Xcode
npx cap open ios
```

Dans Xcode:
1. Sélectionner le projet App
2. Choisir "Any iOS Device" comme destination
3. Product > Archive
4. Distribute App > App Store Connect
5. Upload

### 5. Configuration des métadonnées
1. **Informations générales**:
   - Nom de l'application: Paceo
   - Sous-titre: "Convertisseur d'allure pour coureurs"
   - Description: Description complète de l'application
   - Mots-clés: course, running, allure, vitesse, calculateur

2. **Prix et disponibilité**:
   - Gratuit
   - Disponible dans tous les pays

3. **Version de l'application**:
   - Numéro de version: 1.0.0
   - Notes de version: "Version initiale avec convertisseur d'allure et calculateur d'objectifs"

### 6. Soumission pour révision
1. Remplir toutes les informations requises
2. Ajouter les captures d'écran
3. Soumettre pour révision Apple

## Permissions requises
- Aucune permission spéciale requise
- L'application fonctionne entièrement hors ligne

## Configuration de sécurité
- L'application ne collecte aucune donnée personnelle
- Conformité aux guidelines Apple
- Respect de la vie privée des utilisateurs
