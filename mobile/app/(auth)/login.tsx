import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { useAuthStore } from '../../store/authStore';

const googleWebClientId =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const googleAndroidClientIdPrefix = googleAndroidClientId?.match(
  /^(.+)\.apps\.googleusercontent\.com$/,
)?.[1];
const googleAndroidRedirectUri = googleAndroidClientIdPrefix
  ? `com.googleusercontent.apps.${googleAndroidClientIdPrefix}:/oauth2redirect/google`
  : undefined;
const googleClientIdConfigured =
  Platform.OS === 'web'
    ? Boolean(googleWebClientId)
    : Platform.OS === 'android'
      ? Boolean(googleAndroidClientId)
      : Boolean(googleIosClientId);

export default function LoginScreen() {
  const router = useRouter();
  const { login, googleLogin, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleRequest, googleResponse, promptGoogleLogin] =
    Google.useIdTokenAuthRequest({
      webClientId: googleWebClientId || 'google-web-client-id-not-configured',
      androidClientId: googleAndroidClientId || 'google-android-client-id-not-configured',
      iosClientId: googleIosClientId || 'google-ios-client-id-not-configured',
      redirectUri:
        Platform.OS === 'android' ? googleAndroidRedirectUri : undefined,
      selectAccount: true,
    }, { scheme: 'tempize' });

  useEffect(() => {
    if (!googleResponse) return;

    if (googleResponse.type === 'success') {
      const idToken =
        googleResponse.params.id_token || googleResponse.authentication?.idToken;
      if (!idToken) {
        setLocalError('Google n’a pas retourné de jeton d’identification.');
        setGoogleLoading(false);
        return;
      }

      googleLogin(idToken)
        .then(() => router.replace('/(tabs)/swipe'))
        .catch((err: Error) => {
          setLocalError(err.message || 'La connexion Google a échoué.');
        })
        .finally(() => setGoogleLoading(false));
    } else if (googleResponse.type === 'error') {
      setLocalError('La connexion Google a échoué. Réessaie.');
      setGoogleLoading(false);
    } else {
      setGoogleLoading(false);
    }
  }, [googleResponse, googleLogin, router]);

  const handleGoogleLogin = async () => {
    setLocalError(null);
    clearError();

    if (!googleClientIdConfigured) {
      setLocalError('La connexion Google n’est pas encore configurée pour cette plateforme.');
      return;
    }
    if (!googleRequest) {
      setLocalError('La connexion Google est en cours de préparation. Réessaie dans un instant.');
      return;
    }
    if (Platform.OS === 'android' && !googleAndroidRedirectUri) {
      setLocalError('L’identifiant OAuth Android doit être au format client Google.');
      return;
    }

    setGoogleLoading(true);
    try {
      if (__DEV__) {
        console.info('[Google OAuth]', {
          platform: Platform.OS,
          clientId: googleRequest.clientId,
          redirectUri: googleRequest.redirectUri,
        });
      }
      const result = await promptGoogleLogin();
      if (result.type === 'cancel' || result.type === 'dismiss') {
        setGoogleLoading(false);
      } else if (result.type === 'error') {
        setLocalError('La connexion Google a échoué. Réessaie.');
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Impossible de démarrer la connexion Google.');
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    setLocalError(null);
    clearError();

    if (!email.trim() || !password) {
      setLocalError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/swipe');
    } catch (err: any) {
      // L'erreur est gérée dans le store
    }
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo / Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="flame" size={40} color="#FF4D67" />
          </View>
          <Text style={styles.title}>Tempize</Text>
          <Text style={styles.subtitle}>
            Rencontrez des gens et découvrez des sorties près de chez vous
          </Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          {displayError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#EF476F" />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          {/* Champ Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ex: lucas@example.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (displayError) clearError();
                }}
              />
            </View>
          </View>

          {/* Champ Mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (displayError) clearError();
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bouton Connexion */}
          <TouchableOpacity
            style={[styles.primaryButton, (isLoading || googleLoading) && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading || googleLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, (isLoading || googleLoading) && styles.disabledButton]}
            onPress={handleGoogleLogin}
            disabled={isLoading || googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="logo-google" size={18} color="#FFF" />
                <Text style={styles.googleButtonText}>Continuer avec Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Lien Inscription */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.linkText}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF4D67',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 71, 111, 0.15)',
    borderWidth: 1,
    borderColor: '#EF476F',
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    color: '#EF476F',
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: '#DDD',
    fontSize: 13,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
  },
  eyeIcon: {
    padding: 6,
  },
  primaryButton: {
    backgroundColor: '#FF4D67',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 2,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  separatorText: {
    color: '#888',
    fontSize: 13,
  },
  googleButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#1E1E1E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    color: '#888',
    fontSize: 14,
  },
  linkText: {
    color: '#FF4D67',
    fontSize: 14,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#666',
    fontSize: 13,
  },
});
