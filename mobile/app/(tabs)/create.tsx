import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import BottomNav from '../../components/BottomNav';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';

const CATEGORIES = ['Plein air', 'Culture', 'Sport', 'Bar & Café', 'Jeux', 'Musique', 'Autre'];

export default function CreateScreen() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [acces, setAcces] = useState<'public' | 'validation'>('public');

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Créer un événement" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nom de l'événement *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Café & nouvelles têtes"
              placeholderTextColor={Colors.contour}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Lieu *</Text>
          <TouchableOpacity style={[styles.inputWrapper, styles.inputRow]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Ajouter une adresse"
              placeholderTextColor={Colors.contour}
              editable={false}
            />
            <Ionicons name="location-outline" size={18} color={Colors.secondaire} />
          </TouchableOpacity>
          <Text style={styles.fieldHint}>Indique un lieu pour que chacun puisse te retrouver.</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Catégorie</Text>
          <View style={styles.categoriesWrap}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, selectedCategories.includes(cat) && styles.catPillActive]}
                onPress={() => toggleCategory(cat)}
                activeOpacity={0.75}
              >
                <Text style={[styles.catPillText, selectedCategories.includes(cat) && styles.catPillTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Date *</Text>
            <TouchableOpacity style={[styles.inputWrapper, styles.inputRow]}>
              <Text style={styles.inputPlaceholder}>Choisir</Text>
              <Ionicons name="calendar-outline" size={18} color={Colors.secondaire} />
            </TouchableOpacity>
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Heure *</Text>
            <TouchableOpacity style={[styles.inputWrapper, styles.inputRow]}>
              <Text style={styles.inputPlaceholder}>18:30</Text>
              <Ionicons name="time-outline" size={18} color={Colors.secondaire} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nombre de places</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="8"
              placeholderTextColor={Colors.contour}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Type d'accès</Text>
          <View style={styles.accesSwitcher}>
            <TouchableOpacity
              style={[styles.accesBtn, acces === 'public' && styles.accesBtnActive]}
              onPress={() => setAcces('public')}
              activeOpacity={0.8}
            >
              <Ionicons name="lock-open-outline" size={16} color={acces === 'public' ? Colors.white : Colors.secondaire} />
              <Text style={[styles.accesBtnText, acces === 'public' && styles.accesBtnTextActive]}>
                Accès libre
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.accesBtn, acces === 'validation' && styles.accesBtnActive]}
              onPress={() => setAcces('validation')}
              activeOpacity={0.8}
            >
              <Ionicons name="hourglass-outline" size={16} color={acces === 'validation' ? Colors.white : Colors.secondaire} />
              <Text style={[styles.accesBtnText, acces === 'validation' && styles.accesBtnTextActive]}>
                Sur validation
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <View style={[styles.inputWrapper, styles.textareaWrapper]}>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Une nappe, quelques choses à grignoter et des gens à découvrir..."
              placeholderTextColor={Colors.contour}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
          <Text style={styles.submitBtnText}>Publier l'événement</Text>
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
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  fieldGroup: { gap: Spacing.sm },
  fieldRow: { flexDirection: 'row', gap: Spacing.md },
  label: {
    fontSize: Typography.action,
    fontWeight: Typography.bold,
    color: Colors.encre,
  },
  inputWrapper: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.contour,
    paddingHorizontal: Spacing.md,
    height: 54,
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textareaWrapper: {
    height: 110,
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  input: {
    fontSize: Typography.body,
    color: Colors.encre,
    fontWeight: Typography.medium,
  },
  inputPlaceholder: {
    flex: 1,
    fontSize: Typography.body,
    color: Colors.contour,
  },
  textarea: {
    flex: 1,
    height: 90,
  },
  fieldHint: {
    fontSize: 12,
    color: Colors.secondaire,
    marginTop: 2,
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.contour,
    backgroundColor: Colors.light.surface,
  },
  catPillActive: {
    borderColor: Colors.prune,
    backgroundColor: `${Colors.prune}10`,
  },
  catPillText: {
    fontSize: 13,
    fontWeight: Typography.medium,
    color: Colors.secondaire,
  },
  catPillTextActive: {
    color: Colors.prune,
    fontWeight: Typography.bold,
  },
  accesSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.contour,
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
  },
  accesBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.sm + 2,
  },
  accesBtnActive: { backgroundColor: Colors.prune },
  accesBtnText: {
    fontSize: 13,
    fontWeight: Typography.medium,
    color: Colors.secondaire,
  },
  accesBtnTextActive: {
    color: Colors.white,
    fontWeight: Typography.bold,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.prune,
    height: 54,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  submitBtnText: {
    fontSize: Typography.action,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
});
