import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../constants/theme';

interface AppHeaderProps {
  /** Affiche le logo + nom de ville à gauche (mode Découvrir) */
  showLogo?: boolean;
  /** Titre centré (mode page standard) */
  title?: string;
  /** Ville affichée à droite du logo */
  city?: string;
  /** Icône de retour à gauche */
  showBack?: boolean;
  onBack?: () => void;
  /** Icône action à droite */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

/**
 * AppHeader — composant d'en-tête réutilisable Tempize
 *
 * Deux modes :
 * - showLogo=true  → logo + "tempize" + ville (page Découvrir)
 * - title          → titre centré + optionnel bouton retour
 */
export default function AppHeader({
  showLogo = false,
  title,
  city = 'Paris',
  showBack = false,
  onBack,
  rightIcon,
  onRightPress,
}: AppHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Gauche */}
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.iconButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={22} color={Colors.encre} />
          </TouchableOpacity>
        )}
        {showLogo && (
          <View style={styles.logoRow}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>tempize</Text>
          </View>
        )}
        {title && !showLogo && (
          <Text style={styles.title}>{title}</Text>
        )}
      </View>

      {/* Droite */}
      <View style={styles.right}>
        {showLogo && (
          <TouchableOpacity style={styles.cityPill}>
            <Ionicons name="location-outline" size={14} color={Colors.secondaire} />
            <Text style={styles.cityText}>{city}</Text>
            <Ionicons name="chevron-down" size={12} color={Colors.secondaire} />
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.iconButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={rightIcon} size={22} color={Colors.secondaire} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.light.background,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logo: {
    width: 32,
    height: 32,
  },
  brandName: {
    fontSize: 20,
    fontWeight: Typography.bold,
    color: Colors.prune,
    letterSpacing: -0.3,
  },
  title: {
    fontSize: 18,
    fontWeight: Typography.bold,
    color: Colors.encre,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.contour,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  cityText: {
    fontSize: 13,
    fontWeight: Typography.medium,
    color: Colors.encre,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.contour,
  },
});
