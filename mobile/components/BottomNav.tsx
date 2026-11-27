import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '../constants/theme';

interface TabItem {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  route: string;
}

const TABS: TabItem[] = [
  {
    name: 'swipe',
    label: 'Découvrir',
    icon: 'compass-outline',
    iconActive: 'compass',
    route: '/(tabs)/swipe',
  },
  {
    name: 'create',
    label: 'Créer',
    icon: 'add-circle-outline',
    iconActive: 'add-circle',
    route: '/(tabs)/create',
  },
  {
    name: 'events',
    label: 'Événements',
    icon: 'calendar-outline',
    iconActive: 'calendar',
    route: '/(tabs)/events',
  },
  {
    name: 'profile',
    label: 'Profil',
    icon: 'person-outline',
    iconActive: 'person',
    route: '/(tabs)/profile',
  },
];

/**
 * BottomNav — barre de navigation inférieure réutilisable Tempize
 *
 * Usage : ajouter <BottomNav /> en bas de chaque écran.
 * L'onglet actif est détecté automatiquement via usePathname().
 */
export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const isActive = pathname.includes(tab.name);
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => router.push(tab.route as any)}
              hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={22}
                  color={isActive ? Colors.prune : Colors.secondaire}
                />
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.contour,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  bar: {
    flexDirection: 'row',
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: `${Colors.prune}15`,
  },
  label: {
    fontSize: Typography.meta,
    fontWeight: Typography.medium,
    color: Colors.secondaire,
  },
  labelActive: {
    color: Colors.prune,
    fontWeight: Typography.bold,
  },
});
