import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import BottomNav from '../../components/BottomNav';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';

const INTERESTS = ['Sport', 'Jeux de société', 'Musique', 'Randonnée', 'Bar', 'Culture'];

const MENU_SECTIONS = [
  {
    title: 'Mon compte',
    items: [
      { icon: 'person-outline' as const, label: 'Modifier mon profil' },
      { icon: 'notifications-outline' as const, label: 'Notifications' },
      { icon: 'location-outline' as const, label: 'Localisation & rayon' },
    ],
  },
  {
    title: 'Application',
    items: [
      { icon: 'help-circle-outline' as const, label: 'Aide & support' },
      { icon: 'shield-checkmark-outline' as const, label: 'Confidentialité & RGPD' },
      { icon: 'star-outline' as const, label: "Noter l'application" },
    ],
  },
];

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="Profil" rightIcon="settings-outline" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={Colors.secondaire} />
            </View>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>Lucas Martin</Text>
          <Text style={styles.userBio}>
            Passionné de jeux de société et de sorties sportives 🧗
          </Text>

          <View style={styles.memberBadge}>
            <Ionicons name="star" size={14} color={Colors.orange} />
            <Text style={styles.memberBadgeText}>Membre Standard</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Sorties</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Organisées</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>4,9</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes centres d'intérêt</Text>
          <View style={styles.tagsWrap}>
            {INTERESTS.map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuList}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, idx === section.items.length - 1 && { borderBottomWidth: 0 }]}
                  activeOpacity={0.75}
                >
                  <View style={styles.menuIconWrapper}>
                    <Ionicons name={item.icon} size={18} color={Colors.prune} />
                  </View>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.contour} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.premiumCard} activeOpacity={0.85}>
          <View style={styles.premiumLeft}>
            <View style={styles.premiumIcon}>
              <Ionicons name="diamond" size={22} color={Colors.orange} />
            </View>
            <View>
              <Text style={styles.premiumTitle}>Passez à Tempize Premium</Text>
              <Text style={styles.premiumSub}>Rewind illimité · Passeport · Pass-Droit</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.orange} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color={Colors.erreur} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scroll: { flex: 1 },
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 4,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.contour,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: Colors.prune,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.prune,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  userName: {
    fontSize: 22,
    fontWeight: Typography.bold,
    color: Colors.encre,
  },
  userBio: {
    fontSize: Typography.body,
    color: Colors.secondaire,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${Colors.orange}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: `${Colors.orange}30`,
  },
  memberBadgeText: {
    fontSize: 12,
    fontWeight: Typography.bold,
    color: Colors.orange,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.contour,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    width: '100%',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: Typography.bold,
    color: Colors.encre,
  },
  statLabel: {
    fontSize: Typography.meta,
    color: Colors.secondaire,
    fontWeight: Typography.medium,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.contour,
    alignSelf: 'center',
  },
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: 15,
    fontWeight: Typography.bold,
    color: Colors.encre,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: `${Colors.prune}10`,
    borderWidth: 1,
    borderColor: `${Colors.prune}25`,
  },
  tagText: {
    fontSize: 13,
    fontWeight: Typography.medium,
    color: Colors.prune,
  },
  menuList: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.contour,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.contour,
  },
  menuIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: `${Colors.prune}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    flex: 1,
    fontSize: Typography.action,
    fontWeight: Typography.medium,
    color: Colors.encre,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${Colors.orange}10`,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: `${Colors.orange}30`,
  },
  premiumLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  premiumIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: `${Colors.orange}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTitle: {
    fontSize: Typography.action,
    fontWeight: Typography.bold,
    color: Colors.encre,
  },
  premiumSub: {
    fontSize: 12,
    color: Colors.secondaire,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
  },
  logoutText: {
    fontSize: Typography.action,
    fontWeight: Typography.medium,
    color: Colors.erreur,
  },
});
